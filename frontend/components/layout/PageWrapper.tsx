interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-5">{children}</div>
    </div>
  );
}
