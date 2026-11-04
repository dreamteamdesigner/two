const Toggle = ({ isActive, onToggle, type }) => {
  return (
    <button
      type="button"
      className={`toggle ${type ? "small" : ""}`}
      role="switch"
      aria-checked={isActive}
      onClick={onToggle}
    >
      <div className={`ball ${isActive ? "on" : ""}`}></div>
    </button>
  );
};

export default Toggle;
