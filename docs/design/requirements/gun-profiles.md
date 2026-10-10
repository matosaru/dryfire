# Gun profiles and front-door page

Revision: 1.0 · Scope: user-approved · Implementation: not implemented

Approval evidence: the user requested names/types, up to five guns, separate sounds/drills and refresh/deployment persistence, then said **“approve, but now review”** after receiving the multi-gun design boards. See [CHG-003](approval-log.md#chg-003--multi-gun-flow).

Designs: [front door and library](../multiple-guns-front-door.png), [sounds, drills and history](../multiple-guns-sounds-drills-history.png).

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

## Supporting design details

The following are documented proposals, not additional approval claims:

- Offer edit/delete from profile management. Deleting a gun and all its data must be a distinct confirmed action.
- At capacity show **5 of 5 guns saved** instead of an unexplained disabled Add Gun control.
- Prevent switching ownership during recording or an active drill. Exact behavior for pausing, ending and switching must be resolved with the session specification.
- Gun type initially identifies the profile; it does not silently change existing sound identifiers. Type-specific sound taxonomies or new default drill sets require an approved specification change.

## Acceptance criteria

1. A new user can enter a name, choose one of the three types, save and reach that profile's Home.
2. Five profiles can coexist; an attempt to add a sixth produces an understandable message without changing saved data.
3. Training on profile A cannot update or influence profile B's learned model, presets or results.
4. Resetting a sound on profile A preserves its other sounds, all history and every other profile.
5. Refreshing at the same production address restores the profiles and selection.
6. Existing compatible data is migrated without loss as described in [persistence.md](persistence.md).
