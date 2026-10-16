# Physics Lab — Visual motion edition v3

The existing 104 lessons remain English-only and offline. No new lesson IDs or AI/API dependency were added.

## Interference and diffraction

The previous intensity drawing inadvertently divided the screen coordinate by the changing fringe width. This made different patterns look the same. The revised scene uses a fixed millimetre ruler, so the spacing really changes when wavelength, slit separation or screen distance changes.

- Slit separation moves the openings; each slit has an adjustable finite width.
- Screen distance moves the screen along the apparatus.
- Wavefronts emerge from the openings and propagate while playback runs. Display motion is greatly slowed and schematic; optical intensity is calculated independently from physical parameters.
- The screen shows interference inside the single-slit diffraction envelope. Incoherent illumination or a blocked slit removes the interference cross-term while retaining diffraction.
- The beta marker and numerical value update together. Screen half-range is an explicit manual zoom setting, not an automatic rescaling.
- Longitudinal apparatus, aperture geometry and the screen ruler use separately explained display scales. This keeps millimetre slits and metre distances visible together.

## Fullscreen live graph

Select **Live graph** in the camera toolbar. Choose a quantity (e.g. Fringe width) and a horizontal axis (e.g. Slit separation, Screen distance or Playback progress). The small graph records the visited values and shows the current value. It can be closed independently of the settings panel. On desktop it sits beside the scene; on narrow screens it sits below it.

To animate a parameter and the wavefronts together, open settings, choose **Playback mode → Sweep a control + animate**, then select **Control to demonstrate**. Play/pause, speed, step and scrub remain available. A parameter sweep is not a physical-time process.

Quantity bars supplement numerical readouts across the library. Their fixed reference scales are estimated from default/boundary configurations; values beyond a bar's reference are capped visually and retain their full numerical readout. These bars are quantitative visualisations, not physical changes in apparatus shape.

## Wider geometry review

Every control in all 104 lessons was sampled at its endpoints. `VISUAL-RESPONSE-AUDIT.md` records whether it changed the diagram, numerical quantities, or neither at that sampled phase/configuration. Numerical-only controls can be inspected with bars and the selected live graph; the audit does not claim every variable changes apparatus geometry.

Corrections include the actual inclined-plane angle and attached forces; rolling-plane angle and moving velocity vector; pendulum length, time dependence and attached force arrows; charge separation; centre-of-mass spacing; bubble radius; uncertainty rectangle/bands; thermal expansion length; calorimetry mass/temperature encoding; heat-conduction length; solenoid winding density; transformer turn representation; wire probe distance; parallel-wire separation; selected force magnitudes; prism angle/deviation; and equivalent-lens focusing. Geometric and schematic limitations remain stated in the lessons. Some time-normalised models intentionally show comparable phases rather than different travel distances.

## Validation

- 3,128 model scenarios and 46 reference/invariant assertions passed across 104 lessons.
- 471 preset entries passed range/finite-geometry checks.
- Added optical tests verify fixed screen coordinates, intensity changes for d, D, wavelength and slit width, moving wavefronts and screen movement. Tests verify the shown incline angle equals the control value.
- Finite-slit envelope tests cover incoherent and blocked-slit limits.
- Simulated-DOM checks cover playback, fullscreen controls, all presets, selectable live graphs and combined sweep/wave playback.
- Four rendered YDSE configurations were inspected side by side; the PNG preview is included. This is static rendered-scene review, not a native browser/video review.
- Real mobile/browser rendering and touch performance remain unverified in this environment because Chromium cannot launch under its process restrictions.

Export your existing settings before opening the new filename and import them if needed. Source and tests are included in the ZIP.
