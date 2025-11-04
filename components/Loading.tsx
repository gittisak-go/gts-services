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
      ? "min-h-screen flex justify-center items-center"
      : "min-h-screen p-2 flex justify-center items-start bg-gray-50";

  const cardClasses =
    variant === "centered"
      ? "bg-white rounded-lg p-6 shadow-sm max-w-sm w-full text-center"
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
