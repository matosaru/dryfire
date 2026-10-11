# Gun profiles and front-door page

Revision: 1.2 · Scope: user-approved · Implementation: implemented and locally validated (CHG-012); publication/deployment tracked separately

Approval evidence: the user requested names/types, up to five guns, separate sounds/drills and refresh/deployment persistence, then said **“approve, but now review”** after receiving the multi-gun design boards. See [CHG-003](../project/approval-log.md#chg-003--multi-gun-flow).

Historical reviewed designs: [front door and library](../design/archive/chg-003/proposals/front-door.png), [sounds, drills and history](../design/archive/chg-003/proposals/gun-owned-data.png).

Local implementation captures: [first-gun setup](../design/archive/chg-012/gun-setup/create.png), [My Guns](../design/archive/chg-012/guns/library.png), [selected-gun Home](../design/archive/chg-012/home/overview.png). Current validation/publication status is in [implementation history](../project/implementation-history.md); screenshots are not evidence of production deployment.

| ID | Requirement | State |
| --- | --- | --- |
| GUN-01 | On first use, ask the user for a gun name and type before opening that gun's training dashboard. A name must not be blank. | Approved |
| GUN-02 | Offer exactly these type labels: **Handguns**, **Rifles and Carbines**, **Shotguns**. | Approved |
| GUN-03 | Support up to five saved gun profiles. Display capacity and prevent a sixth profile. | Approved |
| GUN-04 | My Guns shows saved profiles and lets the user select one or add another while capacity remains. | Approved flow |
| GUN-05 | The selected gun's Home displays its name/type and entries for Learn Sounds, Drills, Live Listen and History. Keep a clear gun switcher. | Approved flow |
| GUN-06 | Keep learned sounds, custom drills, drill configuration and history separate for each gun. Classification uses only the selected gun's learned model. | Approved |
| GUN-07 | Remember profiles and the selected gun across refreshes and compatible same-origin deployments. | Approved |
| GUN-08 | Do not apply the future free-version one-gun limit in this iteration. | Explicitly deferred restriction |
| GUN-09 | Show the selected gun consistently on its sound, drill and history pages. | Approved flow |

## Current correction — CHG-019

The user directly requested modifying existing guns and type images in selectors. These current layouts supersede the text-only selector captures: [Gun Setup](../design/screens/gun-setup/README.md), [My Guns](../design/screens/guns/README.md), and [Home/active selector](../design/screens/home/README.md).

| ID | Requirement | State |
| --- | --- | --- |
| GUN-10 | My Guns offers a separate reachable Edit action for every saved profile. Prefill the existing name/type; Save updates the same ID and retains all owned examples, calibration, presets, configuration and history. Cancel changes nothing. Editing a different profile does not implicitly switch the active gun; save returns to My Guns with updated details. | Approved by direct instruction, CHG-019 |
| GUN-11 | Show locally authored, distinct Handgun / Rifle-Carbine / Shotgun illustrations in type choices, gun library and active selector. Keep exact readable type labels, accessible selection and Dark/Light contrast. A profile without a type shows a neutral placeholder rather than a guessed firearm. | Approved by direct instruction, CHG-019 |

Changing the name/type is descriptive, not a calibration migration. Keep existing gun ownership and data; historical session name/type snapshots remain historical. Editing is locked during active capture or unsaved-session recovery. Setup uses the same supported type value as backup/storage; images cannot introduce new persisted identifiers. Individual gun deletion remains proposed; CHG-019 separately approves explicit Settings all-library reset.

## Supporting design details

The following are documented proposals, not additional approval claims:

- Individual profile deletion remains proposed; approved editing is defined above. Deleting a single gun and all its data would require a distinct confirmed action.
- At capacity show **5 of 5 guns saved** instead of an unexplained disabled Add Gun control.
- Prevent switching ownership during recording or an active drill. Exact behavior for pausing, ending and switching must be resolved with the session specification.
- Gun type initially identifies the profile; it does not silently change existing sound identifiers. Type-specific sound taxonomies or new default drill sets require an approved specification change.

## Current implementation slice

CHG-012 implements the previously approved first-use form, five-profile library, selected-gun switcher and ownership of sounds, custom presets and recognition history. The current **Dry Fire With Ease** wordmark applies; the reviewed flow snapshots remain unchanged. There is no visual redraw because this work implements that approved flow rather than proposing a different one.

The database upgrade preserves existing single-profile data in one profile that needs the user's name and type before training continues. No legacy type is guessed. Capture/listening starts with a fixed owning gun; the user must stop the operation before switching guns. This is an engineering safeguard against mixing data, not approval of future session pause/resume rules.

Routine form validation trims names, accepts 1–80 characters and requires one of the exact three approved type labels without a silently chosen default.

Profile deletion, the deferred free-plan cap, cloud synchronization, dedicated session results and fixed/random session timing were excluded from the CHG-012 slice. CHG-014 separately approves and implements detailed sessions/configuration/results; current status is in the drill specification and tracker. Recognition-event history remains distinct from that dedicated session feature. Individual profile deletion/free cap/cloud remain excluded. The separate whole-library reset requested in CHG-019 is defined in Settings.

## Acceptance criteria

1. A new user can enter a name, choose one of the three types, save and reach that profile's Home.
2. Five profiles can coexist; an attempt to add a sixth produces an understandable message without changing saved data.
3. Training on profile A cannot update or influence profile B's learned model, presets or results.
4. Resetting a sound on profile A preserves its other sounds, all history and every other profile.
5. Refreshing at the same production address restores the profiles and selection.
6. Existing compatible data is migrated without loss as described in [persistence.md](persistence.md).

7. Edit both selected and nonselected profiles, cancel or save, and reload: preserve identity, selection and all owned data while updating the intended name/type and visible illustration.
