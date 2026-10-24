export type GunSwitcherProps = {
  name?: string;
  type?: string;
  imageSrc?: string;
  hidden?: boolean;
  disabled?: boolean;
  title?: string;
  onSelect?: () => void;
};

/** Selected-profile presentation; the owning feature controls readiness and locks. */
export function GunSwitcher({ name = '', type = '', imageSrc = '/gun-types/unknown.svg', hidden = true, disabled = false, title, onSelect }: GunSwitcherProps) {
  return <button id="gunSwitcherBtn" className={`gun-switcher${hidden ? ' hidden' : ''}`} type="button" disabled={disabled} title={title}
    aria-label={name ? `Switch gun. Selected: ${name}, ${type || 'type not set'}` : 'Choose a gun'} onClick={onSelect}>
    <img id="activeGunImage" className="gun-type-image gun-switcher-image" src={imageSrc} width="96" height="56" alt="" />
    <span className="gun-switcher-copy"><span className="gun-switcher-label">Active gun</span><strong id="activeGunName">{name}</strong><span id="activeGunType">{type}</span></span>
    <span className="gun-switcher-action">Switch gun <span aria-hidden="true">⌄</span></span>
  </button>;
}
