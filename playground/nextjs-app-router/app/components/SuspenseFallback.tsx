export default function SuspenseFallback() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 w-1/3 rounded-md bg-gray-200" />
      <div className="h-4 w-full rounded-md bg-gray-200" />
      <div className="h-4 w-5/6 rounded-md bg-gray-200" />
      <div className="h-4 w-2/3 rounded-md bg-gray-200" />
    </div>
  );
}
