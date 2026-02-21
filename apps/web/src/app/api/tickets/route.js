import { NextResponse } from 'next/server';
import Ticket from '@/models/Ticket';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

export async function GET(request) {
    try {
        await dbConnect();

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assignedTo = searchParams.get('assignedTo');

        // Build Query
        const query = {};
        
        // Regular users can only see their own tickets
        if (!['admin', 'manager'].includes(user.role)) {
            query.createdBy = user._id;
        } else {
            // Admin/Manager can filter
            if (assignedTo === 'me') query.assignedTo = user._id;
            else if (assignedTo === 'unassigned') query.$or = [{ assignedTo: { $exists: false } }, { assignedTo: null }];
            else if (assignedTo) query.assignedTo = assignedTo;
        }

        if (status && status !== 'all') query.status = status;
        if (priority && priority !== 'all') query.priority = priority;

        const tickets = await Ticket.find(query)
            .populate('createdBy', 'name email avatar')
            .populate('assignedTo', 'name email avatar')
            .select('-messages') // Don't send full thread in list
            .sort({ updatedAt: -1 });

        return NextResponse.json({ success: true, data: tickets });
    } catch (error) {
        console.error('Ticket fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.subject || !body.description) {
            return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 });
        }

        // Create ticket with initial message
        const ticketData = {
            subject: body.subject,
            description: body.description,
            category: body.category || 'general',
            priority: body.priority || 'medium',
            createdBy: user._id,
            messages: [{
                sender: user._id,
                message: body.description,
                isInternal: false
            }]
        };

        // Auto-assign to manager/admin if configured (optional)
        if (body.assignedTo) {
            ticketData.assignedTo = body.assignedTo;
        }

        const ticket = await Ticket.create(ticketData);

        return NextResponse.json({ success: true, data: ticket }, { status: 201 });

    } catch (error) {
        console.error('Ticket creation error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
