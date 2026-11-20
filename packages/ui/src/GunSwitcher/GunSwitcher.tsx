export type GunSwitcherProps = {
  name?: string;
  type?: string;
  imageSrc?: string;
  hidden?: boolean;
  disabled?: boolean;
  title?: string;
  onSelect?: () => void;
  copy?: { switchSelected: string; choose: string; typeUnset: string; active: string; switch: string };
};

/** Selected-profile presentation; the owning feature controls readiness and locks. */
const defaultCopy = { switchSelected: 'Switch gun. Selected: {{name}}, {{type}}', choose: 'Choose a gun', typeUnset: 'type not set', active: 'Active gun', switch: 'Switch gun' };
export function GunSwitcher({ name = '', type = '', imageSrc = '/gun-types/unknown.svg', hidden = true, disabled = false, title, onSelect, copy = defaultCopy }: GunSwitcherProps) {
  return <button id="gunSwitcherBtn" className={`gun-switcher${hidden ? ' hidden' : ''}`} type="button" disabled={disabled} title={title}
    aria-label={name ? copy.switchSelected.replace('{{name}}', name).replace('{{type}}', type || copy.typeUnset) : copy.choose} onClick={onSelect}>
    <img id="activeGunImage" className="gun-type-image gun-switcher-image" src={imageSrc} width="96" height="56" alt="" />
    <span className="gun-switcher-copy"><span className="gun-switcher-label">{copy.active}</span><strong id="activeGunName">{name}</strong><span id="activeGunType">{type}</span></span>
    <span className="gun-switcher-action">{copy.switch} <span aria-hidden="true">⌄</span></span>
  </button>;
}
