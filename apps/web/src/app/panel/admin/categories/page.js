"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/common/Table";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Plus, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField"; // Assuming exists or use InputField for parentId
import { Formik, Form } from "formik";
import * as Yup from "yup";

const CategorySchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    slug: Yup.string(),
    parentId: Yup.string().nullable(),
});

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get("/api/categories?type=list");
            setCategories(data.data);
        } catch (error) {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await axios.delete(`/api/categories/${id}`);
            toast.success("Category deleted");
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete");
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            if (editingCategory) {
                await axios.put(`/api/categories/${editingCategory._id}`, values);
                toast.success("Category updated");
            } else {
                await axios.post("/api/categories", values);
                toast.success("Category created");
            }
            fetchCategories();
            setIsModalOpen(false);
            setEditingCategory(null);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const openCreate = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const openEdit = (cat) => {
        setEditingCategory(cat);
        setIsModalOpen(true);
    };

    // Flattened list for Parent dropdown
    const parentOptions = [
        { value: "", label: "No Parent (Root)" },
        ...categories
            .filter((c) => c._id !== editingCategory?._id) // Prevent self-parenting
            .map((c) => ({ value: c._id, label: c.name })),
    ];

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Organize products with categories and hierarchies.
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    icon={<Plus size={16} />}
                    className="w-full md:w-auto"
                >
                    Add Category
                </Button>
            </div>

            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((cat) => (
                                <TableRow key={cat._id}>
                                    <TableCell className="font-medium">
                                        {/* Visual indentation */}
                                        <div style={{ paddingLeft: `${cat.level * 20}px` }}>
                                            {cat.level > 0 && "└─ "} {cat.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{cat.slug}</TableCell>
                                    <TableCell>{cat.parentId || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{cat.level}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openEdit(cat)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500"
                                                onClick={() => handleDelete(cat._id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? "Edit Category" : "New Category"}
            >
                <Formik
                    initialValues={{
                        name: editingCategory?.name || "",
                        slug: editingCategory?.slug || "",
                        parentId: editingCategory?.parentId || "",
                    }}
                    validationSchema={CategorySchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4">
                            <InputField name="name" label="Name" placeholder="e.g. Electronics" />
                            <InputField
                                name="slug"
                                label="Slug (optional)"
                                placeholder="e.g. electronics"
                            />

                            {/* Simple select for parent */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Parent Category
                                </label>
                                <SelectField name="parentId" options={parentOptions} />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" loading={isSubmitting}>
                                    {editingCategory ? "Update" : "Create"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </ContentWrapper>
    );
}
