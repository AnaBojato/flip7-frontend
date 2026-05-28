type RuleCardProps = {
  title: string;
  description: string;
};

function RuleCard({
  title,
  description,
}: RuleCardProps) {
  return (
    <div className="rule-card">
      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}

export default RuleCard;