import styles from "@/styles/components/SidebarButton.module.css";

type Props = {
  containerClassName?: string;
  innerContainerClassName?: string;
  labelClassName?: string;
  imageClassName?: string;
  active?: boolean;
  onClick?: () => void;
  Icon?: React.ComponentClass<any> | React.FC<any>;
  label: string;
  disabled?: boolean;
  testId?: string;
};

function SidebarButton({
  containerClassName,
  innerContainerClassName,
  labelClassName,
  imageClassName,
  active = false,
  onClick = () => {},
  Icon,
  label,
  disabled = false,
  testId,
}: Props) {
  return (
    <div
      className={`${styles.container} ${containerClassName} ${
        !active && !disabled && `${styles.container_hover}`
      } ${active ? styles.button_active : ""}`}
      data-testid={testId}
    >
      <button
        className={`${styles.innerContainer} ${innerContainerClassName}`}
        onClick={onClick}
        disabled={disabled}
      >
        {Icon && (
          <Icon
            className={`${styles.image} ${imageClassName} ${active ? styles.icon_active : ""}`}
          />
        )}
        <p className={`${styles.label} ${labelClassName} ${active ? styles.label_active : ""}`}>
          {label}
        </p>
      </button>
    </div>
  );
}

export default SidebarButton;
