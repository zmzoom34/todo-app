const TimelineItem = ({ icon, text, date }) => (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {icon}
      <span className="truncate">{text}</span>
      <span>
        {new Date(date).toLocaleString()}
      </span>
    </div>
  );

  export default TimelineItem