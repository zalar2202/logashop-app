export const ContentWrapper = ({ children, className = "" }) => {
    return (
        <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>{children}</div>
    );
};
