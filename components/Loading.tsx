interface LoadingProps {
  message?: string;
  showSpinner?: boolean;
  variant?: "centered" | "top";
}

export default function Loading({
  message = "กำลังโหลด...",
  showSpinner = true,
  variant = "centered",
}: LoadingProps) {
  const containerClasses =
    variant === "centered"
      ? "fixed inset-0 flex justify-center items-center bg-gray-50/50 backdrop-blur-sm z-50"
      : "min-h-screen p-2 flex justify-center items-start bg-gray-50";

  const cardClasses =
    variant === "centered"
      ? "bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4 text-center"
      : "bg-white rounded-lg p-4 shadow-sm max-w-full w-full";

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        {showSpinner && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}
        <h1 className="text-base font-semibold text-orange-700 text-center">
          {message}
        </h1>
      </div>
    </div>
  );
}
