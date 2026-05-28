import "./manualSection.css";

type ManualSectionProps = {
  title: string;
  children: React.ReactNode;
};

function ManualSection({
  title,
  children,
}: ManualSectionProps) {
  return (
    <section className="manual-section">
      <h2 className="manual-section-title">
        {title}
      </h2>

      <div className="manual-section-content">
        {children}
      </div>
    </section>
  );
}

export default ManualSection;