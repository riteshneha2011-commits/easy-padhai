'use strict';
const CHAPTERS={"11": ["Units and Measurements", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion", "Work, Energy and Power", "System of Particles and Rotational Motion", "Gravitation", "Mechanical Properties of Solids", "Mechanical Properties of Fluids", "Thermal Properties of Matter", "Thermodynamics", "Kinetic Theory", "Oscillations", "Waves"], "12": ["Electric Charges and Fields", "Electrostatic Potential and Capacitance", "Current Electricity", "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves", "Ray Optics and Optical Instruments", "Wave Optics", "Dual Nature of Radiation and Matter", "Atoms", "Nuclei", "Semiconductor Electronics"]};
const LESSONS=[
  {
    "id": "vernier",
    "grade": 11,
    "ch": 1,
    "title": "Vernier calipers",
    "kind": "2D",
    "params": [
      {
        "key": "x",
        "label": "Opening",
        "min": 0,
        "max": 30,
        "step": 0.1,
        "value": 12.3,
        "unit": "mm"
      },
      {
        "key": "zero",
        "label": "Zero error",
        "min": -0.5,
        "max": 0.5,
        "step": 0.1,
        "value": 0,
        "unit": "mm"
      }
    ],
    "equation": "Reading = main scale + vernier coincidence × 0.1 mm − zero error",
    "explain": "Read the main scale, then find the vernier division that aligns with a main-scale mark. Subtract the zero error from the observed reading.",
    "assumptions": "Illustrative 10-division vernier; 10 VSD = 9 mm. Scale geometry is magnified.",
    "question": "What correction is needed for a +0.2 mm zero error?",
    "answer": "Subtract 0.2 mm from the observed reading.",
    "scope": "Practical"
  },
  {
    "id": "screw",
    "grade": 11,
    "ch": 1,
    "title": "Screw gauge",
    "kind": "2D",
    "params": [
      {
        "key": "x",
        "label": "Thickness",
        "min": 0,
        "max": 10,
        "step": 0.01,
        "value": 2.37,
        "unit": "mm"
      },
      {
        "key": "zero",
        "label": "Zero error",
        "min": -0.05,
        "max": 0.05,
        "step": 0.01,
        "value": 0,
        "unit": "mm"
      }
    ],
    "equation": "LC = pitch/divisions = 0.5/50 = 0.01 mm",
    "explain": "A rotating thimble moves the spindle by one pitch per revolution. The sleeve and thimble together resolve smaller lengths.",
    "assumptions": "Illustrative instrument; pitch 0.5 mm and 50 thimble divisions.",
    "question": "How far does the spindle move in one full turn?",
    "answer": "0.5 mm: 50 divisions multiplied by the 0.01 mm least count.",
    "scope": "Practical"
  },
  {
    "id": "uncertainty",
    "grade": 11,
    "ch": 1,
    "title": "Uncertainty and significant figures",
    "kind": "2D",
    "params": [
      {
        "key": "a",
        "label": "Length",
        "min": 1,
        "max": 20,
        "step": 0.1,
        "value": 10,
        "unit": "cm"
      },
      {
        "key": "da",
        "label": "Length uncertainty",
        "min": 0.01,
        "max": 1,
        "step": 0.01,
        "value": 0.1,
        "unit": "cm"
      },
      {
        "key": "b",
        "label": "Width",
        "min": 1,
        "max": 20,
        "step": 0.1,
        "value": 5,
        "unit": "cm"
      },
      {
        "key": "db",
        "label": "Width uncertainty",
        "min": 0.01,
        "max": 1,
        "step": 0.01,
        "value": 0.1,
        "unit": "cm"
      }
    ],
    "equation": "A = ab; ΔA/A ≈ Δa/a + Δb/b",
    "explain": "Measurements have uncertainty. For a product, first-order worst-case fractional uncertainties add; the largest relative contribution is the best target for improvement.",
    "assumptions": "First-order worst-case propagation; no probabilistic independence assumed.",
    "question": "Which measurement should you improve to reduce the area uncertainty most?",
    "answer": "The measurement with the larger fractional uncertainty, uncertainty divided by its value.",
    "scope": "Theory"
  },
  {
    "id": "linear",
    "grade": 11,
    "ch": 2,
    "title": "Motion and x–v–a graphs",
    "kind": "2D",
    "params": [
      {
        "key": "u",
        "label": "Initial velocity",
        "min": -10,
        "max": 10,
        "step": 1,
        "value": 2,
        "unit": "m/s"
      },
      {
        "key": "a",
        "label": "Acceleration",
        "min": -4,
        "max": 4,
        "step": 0.5,
        "value": 1,
        "unit": "m/s²"
      }
    ],
    "equation": "x = ut + ½at²; v = u + at",
    "explain": "The slope of position against time is velocity. The slope of velocity against time is acceleration. A negative velocity means motion in the negative direction, not necessarily slowing down.",
    "assumptions": "Constant acceleration; x₀ = 0. Set a = −g and u = 0 for downward free fall.",
    "question": "Does negative acceleration always mean slowing down?",
    "answer": "No. If velocity is also negative, the speed can increase.",
    "scope": "Theory"
  },
  {
    "id": "vectors",
    "grade": 11,
    "ch": 3,
    "title": "Vector addition and products",
    "kind": "3D",
    "params": [
      {
        "key": "a",
        "label": "Vector A",
        "min": 1,
        "max": 5,
        "step": 0.5,
        "value": 3,
        "unit": "units"
      },
      {
        "key": "b",
        "label": "Vector B",
        "min": 1,
        "max": 5,
        "step": 0.5,
        "value": 2,
        "unit": "units"
      },
      {
        "key": "angle",
        "label": "Angle",
        "min": 0,
        "max": 180,
        "step": 5,
        "value": 60,
        "unit": "°"
      }
    ],
    "equation": "R = A + B; A·B = AB cosθ; |A×B| = AB sinθ",
    "explain": "Add vectors head to tail to find the resultant. The dot product measures alignment; the cross product is perpendicular to the plane of the two vectors.",
    "assumptions": "Vectors lie in xy plane; the displayed cross product points along +z.",
    "question": "What happens to the dot and cross products at 90 degrees?",
    "answer": "The dot product is zero and the cross-product magnitude is AB, its maximum for fixed magnitudes.",
    "scope": "Theory"
  },
  {
    "id": "projectile",
    "grade": 11,
    "ch": 3,
    "title": "Projectile motion",
    "kind": "3D",
    "params": [
      {
        "key": "u",
        "label": "Launch speed",
        "min": 5,
        "max": 40,
        "step": 1,
        "value": 20,
        "unit": "m/s"
      },
      {
        "key": "angle",
        "label": "Launch angle",
        "min": 5,
        "max": 85,
        "step": 1,
        "value": 45,
        "unit": "°"
      },
      {
        "key": "g",
        "label": "Gravity",
        "min": 1.6,
        "max": 20,
        "step": 0.1,
        "value": 9.8,
        "unit": "m/s²"
      }
    ],
    "equation": "x = u cosθ t; y = u sinθ t − ½gt²; R = u² sin2θ/g",
    "explain": "Horizontal and vertical motion are independent. Gravity changes the vertical velocity while the horizontal velocity stays constant. Together they form a parabolic path.",
    "assumptions": "Point particle; no drag; launch and landing at equal height; uniform gravity.",
    "question": "Do launches at 30 and 60 degrees have the same range?",
    "answer": "Yes, on level ground without air resistance. The 60-degree launch stays in the air longer.",
    "scope": "Theory"
  },
  {
    "id": "circular",
    "grade": 11,
    "ch": 3,
    "title": "Uniform circular motion",
    "kind": "3D",
    "params": [
      {
        "key": "r",
        "label": "Radius",
        "min": 1,
        "max": 5,
        "step": 0.5,
        "value": 3,
        "unit": "m"
      },
      {
        "key": "v",
        "label": "Speed",
        "min": 1,
        "max": 8,
        "step": 0.5,
        "value": 4,
        "unit": "m/s"
      },
      {
        "key": "m",
        "label": "Mass",
        "min": 0.5,
        "max": 5,
        "step": 0.5,
        "value": 1,
        "unit": "kg"
      }
    ],
    "equation": "a = v²/r; F = mv²/r; T = 2πr/v",
    "explain": "A constant speed does not mean a constant velocity. The velocity direction changes continuously, requiring an inward acceleration.",
    "assumptions": "Uniform circular motion in xy plane; ideal constraint.",
    "question": "What happens to the required force when the speed doubles?",
    "answer": "It becomes four times as large because the centripetal force is proportional to speed squared.",
    "scope": "Theory"
  },
  {
    "id": "incline",
    "grade": 11,
    "ch": 4,
    "title": "Inclined plane and friction",
    "kind": "2D",
    "params": [
      {
        "key": "m",
        "label": "Mass",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 3,
        "unit": "kg"
      },
      {
        "key": "angle",
        "label": "Slope",
        "min": 0,
        "max": 60,
        "step": 1,
        "value": 25,
        "unit": "°"
      },
      {
        "key": "mu",
        "label": "Friction coefficient",
        "min": 0,
        "max": 1,
        "step": 0.05,
        "value": 0.3,
        "unit": ""
      }
    ],
    "equation": "N = mg cosθ; f ≤ μN; a = g(sinθ − μcosθ) when sliding",
    "explain": "Resolve weight parallel and perpendicular to the slope. Static friction adjusts up to its limit; when that limit is exceeded, the block slides.",
    "assumptions": "Starts at rest. Same coefficient used for static limit and kinetic friction; g = 9.8 m/s².",
    "question": "Is friction always equal to the coefficient times the normal force?",
    "answer": "No. While the block is at rest, friction supplies only the force needed for equilibrium, up to its limiting value.",
    "scope": "Theory"
  },
  {
    "id": "atwood",
    "grade": 11,
    "ch": 4,
    "title": "Connected masses and Newton’s laws",
    "kind": "2D",
    "params": [
      {
        "key": "m1",
        "label": "Left mass",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 3,
        "unit": "kg"
      },
      {
        "key": "m2",
        "label": "Right mass",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 5,
        "unit": "kg"
      }
    ],
    "equation": "a = (m₂−m₁)g/(m₁+m₂); T = 2m₁m₂g/(m₁+m₂)",
    "explain": "The two masses share one rope, so their accelerations have equal magnitudes. Applying Newton's second law to both masses gives the acceleration and tension.",
    "assumptions": "Massless inextensible rope; frictionless massless pulley; g = 9.8.",
    "question": "Is the tension zero when the two masses are equal?",
    "answer": "No. The acceleration is zero, but the tension equals the weight of either mass.",
    "scope": "Theory"
  },
  {
    "id": "banking",
    "grade": 11,
    "ch": 4,
    "title": "Banked road and safe speed",
    "kind": "3D",
    "params": [
      {
        "key": "r",
        "label": "Turn radius",
        "min": 20,
        "max": 150,
        "step": 5,
        "value": 60,
        "unit": "m"
      },
      {
        "key": "angle",
        "label": "Bank angle",
        "min": 0,
        "max": 45,
        "step": 1,
        "value": 15,
        "unit": "°"
      },
      {
        "key": "mu",
        "label": "Level-road friction",
        "min": 0,
        "max": 0.8,
        "step": 0.05,
        "value": 0.3,
        "unit": ""
      }
    ],
    "equation": "v₀ = √(rg tanθ); v_level,max = √(μrg)",
    "explain": "On a banked road, a horizontal component of the normal force can provide the inward force needed for turning. The frictionless design speed is different from the friction-limited speed on a level road.",
    "assumptions": "v₀ ignores friction; separate level-road limit uses μ. These are distinct cases.",
    "question": "Why does banking help even without friction?",
    "answer": "The normal force is tilted, so part of it points toward the centre of the turn.",
    "scope": "Theory"
  },
  {
    "id": "work",
    "grade": 11,
    "ch": 5,
    "title": "Variable force, work and power",
    "kind": "2D",
    "params": [
      {
        "key": "f",
        "label": "Initial force",
        "min": 0,
        "max": 20,
        "step": 1,
        "value": 5,
        "unit": "N"
      },
      {
        "key": "k",
        "label": "Force gradient",
        "min": 0,
        "max": 5,
        "step": 0.5,
        "value": 2,
        "unit": "N/m"
      },
      {
        "key": "x",
        "label": "Displacement",
        "min": 0,
        "max": 10,
        "step": 0.5,
        "value": 4,
        "unit": "m"
      }
    ],
    "equation": "F(x) = F₀ + kx; W = F₀x + ½kx²",
    "explain": "Work is the signed area under a force-displacement graph when the force is parallel to the displacement. Instantaneous power is force multiplied by velocity.",
    "assumptions": "Force parallel to motion; illustrative speed is 1 m/s for power readout.",
    "question": "How does increasing the force change the area under the graph?",
    "answer": "It increases the area and therefore the work done over the same displacement.",
    "scope": "Theory"
  },
  {
    "id": "energy",
    "grade": 11,
    "ch": 5,
    "title": "Conservation of mechanical energy",
    "kind": "3D",
    "params": [
      {
        "key": "m",
        "label": "Mass",
        "min": 1,
        "max": 5,
        "step": 1,
        "value": 2,
        "unit": "kg"
      },
      {
        "key": "h",
        "label": "Release height",
        "min": 1,
        "max": 10,
        "step": 0.5,
        "value": 5,
        "unit": "m"
      }
    ],
    "equation": "mgh + ½mv² = constant",
    "explain": "As a body falls, gravitational potential energy is converted into kinetic energy. Their sum remains constant when air resistance is neglected.",
    "assumptions": "Released from rest; no drag; energy reference at ground.",
    "question": "Does doubling the mass change the impact speed?",
    "answer": "No. It doubles the energy, but the impact speed from the same height remains unchanged.",
    "scope": "Theory"
  },
  {
    "id": "collision",
    "grade": 11,
    "ch": 5,
    "title": "Elastic and inelastic collisions",
    "kind": "2D",
    "params": [
      {
        "key": "m1",
        "label": "Mass 1",
        "min": 1,
        "max": 5,
        "step": 0.5,
        "value": 2,
        "unit": "kg"
      },
      {
        "key": "m2",
        "label": "Mass 2",
        "min": 1,
        "max": 5,
        "step": 0.5,
        "value": 2,
        "unit": "kg"
      },
      {
        "key": "u",
        "label": "Incident speed",
        "min": 1,
        "max": 6,
        "step": 0.5,
        "value": 4,
        "unit": "m/s"
      },
      {
        "key": "e",
        "label": "Restitution",
        "min": 0,
        "max": 1,
        "step": 0.1,
        "value": 1,
        "unit": ""
      }
    ],
    "equation": "Momentum conserved; v₂−v₁ = e(u₁−u₂)",
    "explain": "Momentum is conserved in an isolated collision. Kinetic energy is conserved only in an elastic collision; the restitution coefficient controls the relative separation speed.",
    "assumptions": "1D central collision; second body initially at rest; no external impulse.",
    "question": "What happens when the restitution coefficient is zero?",
    "answer": "Both bodies leave with the same velocity, equal to the initial total momentum divided by the total mass.",
    "scope": "Theory"
  },
  {
    "id": "collision2d",
    "grade": 11,
    "ch": 5,
    "title": "Two-dimensional elastic collision",
    "kind": "3D",
    "params": [
      {
        "key": "u",
        "label": "Incident speed",
        "min": 1,
        "max": 8,
        "step": 0.5,
        "value": 4,
        "unit": "m/s"
      },
      {
        "key": "angle",
        "label": "Scattering angle",
        "min": 5,
        "max": 85,
        "step": 5,
        "value": 40,
        "unit": "°"
      }
    ],
    "equation": "v₁ = u cosθ; v₂ = u sinθ; v₁ ⟂ v₂",
    "explain": "In an elastic collision of equal masses with one initially at rest, the outgoing velocity vectors are perpendicular. Their vector sum equals the initial velocity.",
    "assumptions": "Equal smooth masses; one target at rest; centre-of-mass impact geometry encoded by scattering angle.",
    "question": "What do you obtain by adding the two outgoing velocity vectors?",
    "answer": "The incoming velocity vector, expressing momentum conservation for the equal masses.",
    "scope": "Theory"
  },
  {
    "id": "vertical",
    "grade": 11,
    "ch": 5,
    "title": "Vertical circle and contact",
    "kind": "2D",
    "params": [
      {
        "key": "r",
        "label": "Radius",
        "min": 1,
        "max": 4,
        "step": 0.5,
        "value": 2,
        "unit": "m"
      },
      {
        "key": "u",
        "label": "Bottom speed",
        "min": 4,
        "max": 20,
        "step": 0.5,
        "value": 12,
        "unit": "m/s"
      }
    ],
    "equation": "v² = u² − 2gr(1−cosθ); N = m(v²/r + g cosθ)",
    "explain": "Speed decreases as the body rises around a vertical circle. A track can push but cannot pull the body inward: contact is lost if the required reaction becomes negative.",
    "assumptions": "Unit mass inside a circular track. Animation pauses at loss of contact or turning point; no post-release trajectory.",
    "question": "What is the minimum bottom speed for a complete vertical loop?",
    "answer": "The square root of 5gr, so that the normal reaction at the top is just zero.",
    "scope": "Theory"
  },
  {
    "id": "com",
    "grade": 11,
    "ch": 6,
    "title": "Centre of mass",
    "kind": "3D",
    "params": [
      {
        "key": "m1",
        "label": "Mass 1",
        "min": 1,
        "max": 8,
        "step": 1,
        "value": 2,
        "unit": "kg"
      },
      {
        "key": "m2",
        "label": "Mass 2",
        "min": 1,
        "max": 8,
        "step": 1,
        "value": 4,
        "unit": "kg"
      },
      {
        "key": "d",
        "label": "Separation",
        "min": 1,
        "max": 8,
        "step": 0.5,
        "value": 6,
        "unit": "m"
      }
    ],
    "equation": "x_cm = (m₁x₁ + m₂x₂)/(m₁+m₂)",
    "explain": "The centre of mass lies closer to the larger mass. It is the weighted average of the positions, not necessarily a point occupied by material.",
    "assumptions": "Two point masses at x = 0 and x = d.",
    "question": "Where does the centre of mass move when mass 2 increases?",
    "answer": "Toward mass 2.",
    "scope": "Theory"
  },
  {
    "id": "torque",
    "grade": 11,
    "ch": 6,
    "title": "Torque and equilibrium",
    "kind": "3D",
    "params": [
      {
        "key": "f",
        "label": "Force",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 5,
        "unit": "N"
      },
      {
        "key": "r",
        "label": "Lever arm",
        "min": 0.5,
        "max": 3,
        "step": 0.1,
        "value": 2,
        "unit": "m"
      },
      {
        "key": "angle",
        "label": "Force angle",
        "min": 0,
        "max": 180,
        "step": 5,
        "value": 90,
        "unit": "°"
      }
    ],
    "equation": "τ = rF sinθ",
    "explain": "A force produces a turning effect only through its component perpendicular to the lever arm. A force whose line of action passes through the pivot produces no torque.",
    "assumptions": "Rigid lever; instantaneous torque, not a dynamic hinge solver.",
    "question": "What is the torque when the force points directly toward the pivot?",
    "answer": "Zero, because the perpendicular distance from the pivot to the line of action is zero.",
    "scope": "Theory"
  },
  {
    "id": "inertia",
    "grade": 11,
    "ch": 6,
    "title": "Moment of inertia and shape",
    "kind": "3D",
    "params": [
      {
        "key": "m",
        "label": "Mass",
        "min": 1,
        "max": 5,
        "step": 1,
        "value": 2,
        "unit": "kg"
      },
      {
        "key": "r",
        "label": "Radius",
        "min": 0.5,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": "m"
      },
      {
        "key": "shape",
        "label": "Shape: 0 ring · 1 disc · 2 sphere",
        "min": 0,
        "max": 2,
        "step": 1,
        "value": 1,
        "unit": ""
      }
    ],
    "equation": "I_ring = MR²; I_disc = ½MR²; I_sphere = ⅖MR²",
    "explain": "Rotational inertia depends on how far the mass is distributed from the axis. The same torque produces a smaller angular acceleration for a larger moment of inertia.",
    "assumptions": "Uniform ring/disc/solid sphere; symmetry axis through centre; identical applied torque 1 N m.",
    "question": "Which has the smallest angular acceleration: a ring, a disc or a solid sphere of equal mass and radius?",
    "answer": "The ring, because it has the largest moment of inertia about the chosen symmetry axis.",
    "scope": "Theory"
  },
  {
    "id": "angular",
    "grade": 11,
    "ch": 6,
    "title": "Angular momentum conservation",
    "kind": "3D",
    "params": [
      {
        "key": "r",
        "label": "Mass distance",
        "min": 0.5,
        "max": 3,
        "step": 0.1,
        "value": 2,
        "unit": "m"
      },
      {
        "key": "m",
        "label": "Each mass",
        "min": 0.5,
        "max": 3,
        "step": 0.5,
        "value": 1,
        "unit": "kg"
      },
      {
        "key": "ell",
        "label": "Angular momentum",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 4,
        "unit": "kg m²/s"
      }
    ],
    "equation": "L = Iω; I = 2mr²",
    "explain": "Without external torque, angular momentum is conserved. Moving mass closer to the rotation axis decreases the moment of inertia and increases angular speed.",
    "assumptions": "Two point masses on a negligible-mass rotating rod. A parameter change compares steady states.",
    "question": "What happens to angular speed if the mass distance is halved?",
    "answer": "It becomes four times as large because the moment of inertia is proportional to the square of that distance.",
    "scope": "Theory"
  },
  {
    "id": "rolling",
    "grade": 11,
    "ch": 6,
    "title": "Rolling without slipping",
    "kind": "3D",
    "params": [
      {
        "key": "angle",
        "label": "Incline",
        "min": 5,
        "max": 40,
        "step": 1,
        "value": 20,
        "unit": "°"
      },
      {
        "key": "shape",
        "label": "Shape: 0 ring · 1 disc · 2 sphere",
        "min": 0,
        "max": 2,
        "step": 1,
        "value": 1,
        "unit": ""
      },
      {
        "key": "r",
        "label": "Radius",
        "min": 0.2,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "m"
      }
    ],
    "equation": "a = g sinθ/(1 + I/mr²); v = ωr",
    "explain": "A rolling object gains both translational and rotational kinetic energy. Its shape determines how the energy is shared and how quickly it accelerates.",
    "assumptions": "Enough static friction for pure rolling; no energy loss. Included as practical/teaching extension.",
    "question": "Which reaches the bottom sooner: a ring or a solid sphere?",
    "answer": "The solid sphere, provided both roll without slipping on the same slope.",
    "scope": "Extension"
  },
  {
    "id": "orbit",
    "grade": 11,
    "ch": 7,
    "title": "Satellite orbits and Kepler’s laws",
    "kind": "3D",
    "params": [
      {
        "key": "a",
        "label": "Semi-major axis",
        "min": 7,
        "max": 20,
        "step": 0.5,
        "value": 10,
        "unit": "×10⁶ m"
      },
      {
        "key": "e",
        "label": "Eccentricity",
        "min": 0,
        "max": 0.6,
        "step": 0.05,
        "value": 0.2,
        "unit": ""
      }
    ],
    "equation": "T² = 4π²a³/GM; r = a(1−e cosE)",
    "explain": "A satellite moves faster near the attracting body and slower farther away. Equal time intervals sweep equal areas, while the orbital period depends on the semi-major axis.",
    "assumptions": "Earth point-mass field, GM = 3.986×10¹⁴ m³/s². Orbits intersecting Earth are flagged. Animation uses mean anomaly.",
    "question": "Does changing eccentricity change the period if the semi-major axis stays fixed?",
    "answer": "No. The period depends on the semi-major axis and the central mass, not on eccentricity.",
    "scope": "Theory"
  },
  {
    "id": "gravity",
    "grade": 11,
    "ch": 7,
    "title": "Gravity, altitude and depth",
    "kind": "3D",
    "params": [
      {
        "key": "r",
        "label": "Distance from centre",
        "min": 0.1,
        "max": 3,
        "step": 0.05,
        "value": 1.5,
        "unit": "Earth radii"
      }
    ],
    "equation": "Outside: g = GM/r²; inside uniform Earth: g = GM r/R³",
    "explain": "Outside a spherical body, gravity follows an inverse-square law. Inside a uniform-density sphere, the field grows linearly with distance from the centre.",
    "assumptions": "Uniform-density sphere inside Earth; actual Earth has nonuniform density. Potential is zero at infinity.",
    "question": "Are both gravitational field and potential zero at the centre?",
    "answer": "The field is zero, but the potential is finite and negative when its zero is chosen at infinity.",
    "scope": "Theory"
  },
  {
    "id": "escape",
    "grade": 11,
    "ch": 7,
    "title": "Orbital speed and escape energy",
    "kind": "3D",
    "params": [
      {
        "key": "r",
        "label": "Launch radius",
        "min": 1,
        "max": 4,
        "step": 0.1,
        "value": 1,
        "unit": "Earth radii"
      },
      {
        "key": "v",
        "label": "Launch speed",
        "min": 0,
        "max": 20,
        "step": 0.5,
        "value": 8,
        "unit": "km/s"
      }
    ],
    "equation": "v_c = √(GM/r); v_esc = √(2GM/r); ε = v²/2 − GM/r",
    "explain": "Escape speed corresponds to zero total specific mechanical energy. A circular orbit at the same radius requires less speed.",
    "assumptions": "Energy comparison at launch; not a trajectory solver. No atmosphere or Earth rotation.",
    "question": "How does escape speed compare with circular-orbit speed?",
    "answer": "Escape speed is the square root of two times the circular-orbit speed.",
    "scope": "Theory"
  },
  {
    "id": "elastic",
    "grade": 11,
    "ch": 8,
    "title": "Elasticity and Young’s modulus",
    "kind": "3D",
    "params": [
      {
        "key": "f",
        "label": "Load",
        "min": 0,
        "max": 500,
        "step": 10,
        "value": 200,
        "unit": "N"
      },
      {
        "key": "len",
        "label": "Wire length",
        "min": 0.5,
        "max": 3,
        "step": 0.1,
        "value": 1,
        "unit": "m"
      },
      {
        "key": "area",
        "label": "Area",
        "min": 0.5,
        "max": 5,
        "step": 0.1,
        "value": 1,
        "unit": "mm²"
      },
      {
        "key": "Y",
        "label": "Young modulus",
        "min": 20,
        "max": 200,
        "step": 10,
        "value": 100,
        "unit": "GPa"
      }
    ],
    "equation": "Stress = F/A; strain = ΔL/L; Y = stress/strain",
    "explain": "A wire stretches more when it is longer or thinner, or when its material has a smaller Young's modulus. Stress and strain remain proportional in this model.",
    "assumptions": "Linear elastic region only; extension magnified visually; does not model plastic failure.",
    "question": "What happens to extension when the wire length doubles?",
    "answer": "The extension doubles for the same force, area and material; the strain is unchanged.",
    "scope": "Theory"
  },
  {
    "id": "hydrostatic",
    "grade": 11,
    "ch": 9,
    "title": "Hydrostatic pressure",
    "kind": "2D",
    "params": [
      {
        "key": "rho",
        "label": "Liquid density",
        "min": 500,
        "max": 1500,
        "step": 50,
        "value": 1000,
        "unit": "kg/m³"
      },
      {
        "key": "h",
        "label": "Depth",
        "min": 0,
        "max": 10,
        "step": 0.5,
        "value": 3,
        "unit": "m"
      }
    ],
    "equation": "P = P_atm + ρgh",
    "explain": "Pressure in a static liquid increases with depth. At the same depth in the same liquid, pressure does not depend on the vessel's width.",
    "assumptions": "Static incompressible fluid; P_atm = 101325 Pa.",
    "question": "Does a wider vessel give a larger pressure at the same depth?",
    "answer": "No. The fluid density, gravitational acceleration and depth determine the gauge pressure.",
    "scope": "Theory"
  },
  {
    "id": "hydraulic",
    "grade": 11,
    "ch": 9,
    "title": "Pascal’s law: hydraulic lift",
    "kind": "2D",
    "params": [
      {
        "key": "f",
        "label": "Input force",
        "min": 10,
        "max": 200,
        "step": 10,
        "value": 50,
        "unit": "N"
      },
      {
        "key": "a1",
        "label": "Input area",
        "min": 1,
        "max": 5,
        "step": 0.5,
        "value": 2,
        "unit": "cm²"
      },
      {
        "key": "a2",
        "label": "Output area",
        "min": 10,
        "max": 50,
        "step": 5,
        "value": 20,
        "unit": "cm²"
      }
    ],
    "equation": "F₂/F₁ = A₂/A₁; A₁Δx₁ = A₂Δx₂",
    "explain": "An ideal hydraulic system transmits pressure. A larger output piston produces more force, but it moves a shorter distance so that work is conserved.",
    "assumptions": "Ideal incompressible fluid; equal piston heights; friction ignored.",
    "question": "If the area ratio is ten, how far does the output piston move?",
    "answer": "One tenth of the input displacement.",
    "scope": "Theory"
  },
  {
    "id": "buoyancy",
    "grade": 11,
    "ch": 9,
    "title": "Buoyancy and floating",
    "kind": "3D",
    "params": [
      {
        "key": "rho",
        "label": "Object density",
        "min": 200,
        "max": 1600,
        "step": 100,
        "value": 600,
        "unit": "kg/m³"
      },
      {
        "key": "fluid",
        "label": "Liquid density",
        "min": 500,
        "max": 1500,
        "step": 100,
        "value": 1000,
        "unit": "kg/m³"
      },
      {
        "key": "vol",
        "label": "Volume",
        "min": 1,
        "max": 5,
        "step": 0.5,
        "value": 2,
        "unit": "litres"
      }
    ],
    "equation": "F_b = ρ_fluid g V_submerged",
    "explain": "The upward buoyant force equals the weight of displaced fluid. A floating object displaces just enough fluid to balance its own weight.",
    "assumptions": "Uniform block; surface tension ignored. Supplemental prerequisite model.",
    "question": "What happens when the object's density increases?",
    "answer": "The submerged fraction increases. If the object becomes denser than the fluid, it sinks.",
    "scope": "Extension"
  },
  {
    "id": "bernoulli",
    "grade": 11,
    "ch": 9,
    "title": "Continuity and Bernoulli flow",
    "kind": "2D",
    "params": [
      {
        "key": "v",
        "label": "Inlet speed",
        "min": 0.5,
        "max": 4,
        "step": 0.5,
        "value": 2,
        "unit": "m/s"
      },
      {
        "key": "ratio",
        "label": "A₂/A₁",
        "min": 0.25,
        "max": 2,
        "step": 0.05,
        "value": 0.5,
        "unit": ""
      },
      {
        "key": "h",
        "label": "Outlet height",
        "min": 0,
        "max": 3,
        "step": 0.1,
        "value": 0,
        "unit": "m"
      }
    ],
    "equation": "A₁v₁ = A₂v₂; P + ½ρv² + ρgh = constant",
    "explain": "Continuity requires faster flow through a smaller cross-section. For steady ideal flow, pressure, kinetic energy per volume and gravitational energy per volume trade off.",
    "assumptions": "Steady incompressible nonviscous flow; water density 1000 kg/m³; inlet pressure 200 kPa.",
    "question": "At equal height, what happens in a narrower pipe section?",
    "answer": "Speed increases and static pressure decreases.",
    "scope": "Theory"
  },
  {
    "id": "viscosity",
    "grade": 11,
    "ch": 9,
    "title": "Stokes drag and terminal speed",
    "kind": "3D",
    "params": [
      {
        "key": "r",
        "label": "Sphere radius",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "mm"
      },
      {
        "key": "eta",
        "label": "Viscosity",
        "min": 0.5,
        "max": 3,
        "step": 0.1,
        "value": 1,
        "unit": "Pa s"
      },
      {
        "key": "rho",
        "label": "Sphere density",
        "min": 1500,
        "max": 8000,
        "step": 500,
        "value": 3000,
        "unit": "kg/m³"
      }
    ],
    "equation": "v_t = 2r²(ρ_s−ρ_f)g/(9η)",
    "explain": "For slow flow around a small sphere, viscous drag grows with speed. Terminal speed occurs when weight minus buoyancy is balanced by drag.",
    "assumptions": "Creeping-flow Stokes model; fluid density 1000 kg/m³; no wall effects. Check Reynolds number.",
    "question": "What happens to terminal speed when the sphere radius doubles?",
    "answer": "It becomes four times as large, provided the flow remains in the Stokes regime.",
    "scope": "Theory"
  },
  {
    "id": "capillary",
    "grade": 11,
    "ch": 9,
    "title": "Capillarity and contact angle",
    "kind": "2D",
    "params": [
      {
        "key": "r",
        "label": "Tube radius",
        "min": 0.2,
        "max": 2,
        "step": 0.1,
        "value": 0.5,
        "unit": "mm"
      },
      {
        "key": "gamma",
        "label": "Surface tension",
        "min": 0.02,
        "max": 0.08,
        "step": 0.005,
        "value": 0.07,
        "unit": "N/m"
      },
      {
        "key": "angle",
        "label": "Contact angle",
        "min": 0,
        "max": 150,
        "step": 5,
        "value": 20,
        "unit": "°"
      }
    ],
    "equation": "h = 2γ cosθ/(ρgr)",
    "explain": "Surface tension can raise or depress a liquid in a narrow tube. The direction depends on the contact angle, and the height grows as the tube becomes narrower.",
    "assumptions": "ρ = 1000 kg/m³; cylindrical tube, static meniscus; vertical scale magnified.",
    "question": "What is the sign of the capillary height for a contact angle above 90 degrees?",
    "answer": "Negative: the liquid surface is depressed below the surrounding level.",
    "scope": "Theory"
  },
  {
    "id": "bubble",
    "grade": 11,
    "ch": 9,
    "title": "Drops, bubbles and surface energy",
    "kind": "3D",
    "params": [
      {
        "key": "r",
        "label": "Radius",
        "min": 0.5,
        "max": 5,
        "step": 0.5,
        "value": 2,
        "unit": "mm"
      },
      {
        "key": "gamma",
        "label": "Surface tension",
        "min": 0.02,
        "max": 0.08,
        "step": 0.005,
        "value": 0.04,
        "unit": "N/m"
      },
      {
        "key": "film",
        "label": "Surfaces: 1 drop · 2 soap bubble",
        "min": 1,
        "max": 2,
        "step": 1,
        "value": 2,
        "unit": ""
      }
    ],
    "equation": "ΔP = 2nγ/r; E_surface = nγ4πr²",
    "explain": "Surface tension creates an excess pressure across a curved interface. A soap bubble has two surfaces, whereas a liquid drop has one.",
    "assumptions": "Ideal spherical interface; n = number of surfaces; surrounding gas pressure not included.",
    "question": "Which has the greater excess pressure: a small bubble or a large bubble?",
    "answer": "The smaller bubble, for the same surface tension, because excess pressure is inversely proportional to radius.",
    "scope": "Theory"
  },
  {
    "id": "expansion",
    "grade": 11,
    "ch": 10,
    "title": "Thermal expansion",
    "kind": "3D",
    "params": [
      {
        "key": "L",
        "label": "Initial length",
        "min": 0.5,
        "max": 3,
        "step": 0.1,
        "value": 1,
        "unit": "m"
      },
      {
        "key": "alpha",
        "label": "Linear coefficient",
        "min": 5,
        "max": 30,
        "step": 1,
        "value": 12,
        "unit": "×10⁻⁶/K"
      },
      {
        "key": "dt",
        "label": "Temperature rise",
        "min": 0,
        "max": 200,
        "step": 5,
        "value": 100,
        "unit": "K"
      }
    ],
    "equation": "ΔL = αL₀ΔT; ΔV ≈ 3αV₀ΔT",
    "explain": "Heating changes dimensions. In the small-strain approximation, the extension of a uniform solid is proportional to its original length and temperature rise.",
    "assumptions": "Isotropic solid, constant α; small-strain approximation; visible extension exaggerated.",
    "question": "Does a hole in a metal plate become smaller when the plate is heated?",
    "answer": "No. The hole expands just as an imagined piece of the same material filling it would expand.",
    "scope": "Theory"
  },
  {
    "id": "calorimetry",
    "grade": 11,
    "ch": 10,
    "title": "Calorimetry: mixing temperatures",
    "kind": "2D",
    "params": [
      {
        "key": "m1",
        "label": "Hot water mass",
        "min": 0.1,
        "max": 2,
        "step": 0.1,
        "value": 0.5,
        "unit": "kg"
      },
      {
        "key": "t1",
        "label": "Hot temperature",
        "min": 40,
        "max": 90,
        "step": 5,
        "value": 80,
        "unit": "°C"
      },
      {
        "key": "m2",
        "label": "Cold water mass",
        "min": 0.1,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": "kg"
      },
      {
        "key": "t2",
        "label": "Cold temperature",
        "min": 5,
        "max": 35,
        "step": 5,
        "value": 20,
        "unit": "°C"
      }
    ],
    "equation": "T_f = (m₁T₁ + m₂T₂)/(m₁+m₂)",
    "explain": "In an insulated mixture, heat lost by the hot sample equals heat gained by the cold sample. The final temperature lies between the initial temperatures.",
    "assumptions": "Both samples are water with equal specific heat; negligible container heat capacity; no phase change.",
    "question": "What happens when you increase the mass of hot water?",
    "answer": "The final temperature moves closer to the initial hot-water temperature.",
    "scope": "Theory"
  },
  {
    "id": "phase",
    "grade": 11,
    "ch": 10,
    "title": "Heating curve and latent heat",
    "kind": "2D",
    "params": [
      {
        "key": "m",
        "label": "Ice mass",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "kg"
      },
      {
        "key": "power",
        "label": "Heater power",
        "min": 100,
        "max": 1000,
        "step": 50,
        "value": 500,
        "unit": "W"
      }
    ],
    "equation": "Q = mcΔT; Q_phase = mL",
    "explain": "Heating can change temperature or change phase. During an ideal phase transition at fixed pressure, energy is absorbed without a temperature rise.",
    "assumptions": "Water at 1 atm; starts as ice at −20°C; c_ice=2100, c_water=4180 J/kg K; L_f=334 kJ/kg; L_v=2256 kJ/kg.",
    "question": "Where does the supplied energy go during the melting plateau?",
    "answer": "Into changing the phase, rather than raising the temperature.",
    "scope": "Theory"
  },
  {
    "id": "conduction",
    "grade": 11,
    "ch": 10,
    "title": "Heat conduction",
    "kind": "2D",
    "params": [
      {
        "key": "k",
        "label": "Conductivity",
        "min": 10,
        "max": 400,
        "step": 10,
        "value": 100,
        "unit": "W/m K"
      },
      {
        "key": "L",
        "label": "Rod length",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "m"
      },
      {
        "key": "hot",
        "label": "Hot end",
        "min": 40,
        "max": 100,
        "step": 5,
        "value": 80,
        "unit": "°C"
      }
    ],
    "equation": "Heat rate = kA(T_h−T_c)/L",
    "explain": "Energy flows through a material from hotter to colder regions. In steady conduction through a uniform rod, the temperature profile is linear.",
    "assumptions": "Area 1 cm²; cold end 20°C; insulated sides; steady linear temperature profile.",
    "question": "What happens to the heat-transfer rate when the rod length doubles?",
    "answer": "It is halved if the end temperatures, area and material remain unchanged.",
    "scope": "Theory"
  },
  {
    "id": "radiation",
    "grade": 11,
    "ch": 10,
    "title": "Thermal radiation and Wien’s law",
    "kind": "2D",
    "params": [
      {
        "key": "T",
        "label": "Temperature",
        "min": 300,
        "max": 6000,
        "step": 100,
        "value": 3000,
        "unit": "K"
      },
      {
        "key": "eps",
        "label": "Emissivity",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 1,
        "unit": ""
      }
    ],
    "equation": "P/A = εσT⁴; λ_peak T = 2.898×10⁻³ m K",
    "explain": "Hotter objects emit more thermal radiation, and the peak moves to shorter wavelengths. Emissivity controls how strongly the surface radiates relative to a blackbody.",
    "assumptions": "Gray-body power; spectrum uses Planck curve shape. Emitted, not net, power.",
    "question": "How does emitted power change when the absolute temperature doubles?",
    "answer": "It becomes sixteen times as large for the same area and emissivity.",
    "scope": "Theory"
  },
  {
    "id": "convection",
    "grade": 11,
    "ch": 10,
    "title": "Convection currents",
    "kind": "3D",
    "params": [
      {
        "key": "delta",
        "label": "Temperature difference",
        "min": 0,
        "max": 80,
        "step": 5,
        "value": 30,
        "unit": "K"
      }
    ],
    "equation": "Density decreases as warm fluid expands (qualitative)",
    "explain": "Warm fluid can rise while cooler fluid sinks, producing circulation. This is a buoyancy-driven process, not the motion of heat as a separate substance.",
    "assumptions": "Qualitative tracer animation, not a computational fluid-dynamics or turbulence calculation. Speed is illustrative.",
    "question": "Why is natural convection weak without gravity?",
    "answer": "Gravity is needed for the buoyancy force that drives this circulation.",
    "scope": "Theory"
  },
  {
    "id": "thermo",
    "grade": 11,
    "ch": 11,
    "title": "Isothermal and adiabatic processes",
    "kind": "2D",
    "params": [
      {
        "key": "ratio",
        "label": "Final / initial volume",
        "min": 0.5,
        "max": 3,
        "step": 0.1,
        "value": 2,
        "unit": ""
      },
      {
        "key": "mode",
        "label": "Process: 0 isothermal · 1 adiabatic",
        "min": 0,
        "max": 1,
        "step": 1,
        "value": 0,
        "unit": ""
      },
      {
        "key": "gamma",
        "label": "Heat-capacity ratio",
        "min": 1.2,
        "max": 1.7,
        "step": 0.1,
        "value": 1.4,
        "unit": ""
      }
    ],
    "equation": "Isothermal: PV = constant; adiabatic: PV^γ = constant; Q = ΔU + W",
    "explain": "A gas does work when it expands against a pressure. In an adiabatic expansion no heat enters, so the gas supplies that work from its internal energy.",
    "assumptions": "One mole ideal gas; initial T=300 K, V=0.02 m³; reversible quasistatic paths; work done by gas positive.",
    "question": "What happens to temperature in a reversible adiabatic expansion?",
    "answer": "It decreases as the gas does work and loses internal energy.",
    "scope": "Theory"
  },
  {
    "id": "cycle",
    "grade": 11,
    "ch": 11,
    "title": "Cyclic process and heat-engine limit",
    "kind": "2D",
    "params": [
      {
        "key": "Th",
        "label": "Hot reservoir",
        "min": 400,
        "max": 800,
        "step": 20,
        "value": 600,
        "unit": "K"
      },
      {
        "key": "Tc",
        "label": "Cold reservoir",
        "min": 200,
        "max": 350,
        "step": 10,
        "value": 300,
        "unit": "K"
      }
    ],
    "equation": "η_Carnot = 1 − T_c/T_h; W_net = enclosed P–V area",
    "explain": "After a complete thermodynamic cycle, the internal energy returns to its initial value. A heat engine transfers some energy as work and rejects the remainder to a colder reservoir.",
    "assumptions": "Ideal reversible Carnot engine, one mole; plot is a schematic cycle; quantitative efficiency from reservoir temperatures.",
    "question": "What happens to the maximum efficiency if the cold reservoir is made hotter?",
    "answer": "It decreases because the temperature difference available for a reversible heat engine is smaller.",
    "scope": "Theory"
  },
  {
    "id": "gas",
    "grade": 11,
    "ch": 12,
    "title": "Gas particles, pressure and temperature",
    "kind": "3D",
    "params": [
      {
        "key": "T",
        "label": "Temperature",
        "min": 100,
        "max": 600,
        "step": 20,
        "value": 300,
        "unit": "K"
      },
      {
        "key": "V",
        "label": "Volume",
        "min": 5,
        "max": 30,
        "step": 1,
        "value": 10,
        "unit": "litres"
      },
      {
        "key": "M",
        "label": "Molar mass",
        "min": 4,
        "max": 40,
        "step": 2,
        "value": 28,
        "unit": "g/mol"
      }
    ],
    "equation": "PV = nRT; v_rms = √(3RT/M)",
    "explain": "Molecular impacts on the walls produce pressure. Absolute temperature is related to mean translational kinetic energy, while molecular mass affects the typical speed.",
    "assumptions": "One mole ideal gas. Displayed particles are representative tracers, not one mole of individually simulated molecules; time/length rescaled.",
    "question": "What happens to rms speed when the absolute temperature doubles?",
    "answer": "It increases by a factor of the square root of two.",
    "scope": "Theory"
  },
  {
    "id": "equipartition",
    "grade": 11,
    "ch": 12,
    "title": "Degrees of freedom and heat capacity",
    "kind": "2D",
    "params": [
      {
        "key": "f",
        "label": "Active quadratic degrees of freedom",
        "min": 3,
        "max": 7,
        "step": 1,
        "value": 5,
        "unit": ""
      },
      {
        "key": "T",
        "label": "Temperature",
        "min": 100,
        "max": 600,
        "step": 20,
        "value": 300,
        "unit": "K"
      }
    ],
    "equation": "U = (f/2)nRT; C_v = fR/2; C_p = C_v + R",
    "explain": "Each active quadratic degree of freedom contributes one half kT per molecule in the classical model. More active degrees of freedom increase the heat capacity.",
    "assumptions": "Classical ideal gas; chosen f treated constant; quantum freeze-out not calculated.",
    "question": "How does the heat-capacity ratio change when the number of active degrees of freedom increases?",
    "answer": "It decreases, since gamma equals 1 plus 2 divided by the number of degrees of freedom.",
    "scope": "Theory"
  },
  {
    "id": "spring",
    "grade": 11,
    "ch": 13,
    "title": "Spring SHM, phase and energy",
    "kind": "3D",
    "params": [
      {
        "key": "m",
        "label": "Mass",
        "min": 0.2,
        "max": 5,
        "step": 0.1,
        "value": 1,
        "unit": "kg"
      },
      {
        "key": "k",
        "label": "Spring constant",
        "min": 1,
        "max": 40,
        "step": 1,
        "value": 10,
        "unit": "N/m"
      },
      {
        "key": "A",
        "label": "Amplitude",
        "min": 0.1,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": "m"
      }
    ],
    "equation": "x=A cosωt; ω=√(k/m); E=½kA²",
    "explain": "The restoring force is opposite to displacement. Kinetic and spring potential energy exchange throughout each cycle while total energy stays constant.",
    "assumptions": "Ideal horizontal massless spring; no damping; release from +A at rest.",
    "question": "What happens to period and energy if the amplitude doubles?",
    "answer": "The ideal period is unchanged; total energy becomes four times as large.",
    "scope": "Theory"
  },
  {
    "id": "pendulum",
    "grade": 11,
    "ch": 13,
    "title": "Simple pendulum",
    "kind": "3D",
    "params": [
      {
        "key": "L",
        "label": "Length",
        "min": 0.3,
        "max": 3,
        "step": 0.1,
        "value": 1,
        "unit": "m"
      },
      {
        "key": "angle",
        "label": "Initial angle",
        "min": 2,
        "max": 15,
        "step": 1,
        "value": 10,
        "unit": "°"
      },
      {
        "key": "g",
        "label": "Gravity",
        "min": 1.6,
        "max": 20,
        "step": 0.1,
        "value": 9.8,
        "unit": "m/s²"
      }
    ],
    "equation": "T ≈ 2π√(L/g); θ = θ₀ cos(√(g/L)t)",
    "explain": "For small angles, the pendulum behaves approximately as a simple harmonic oscillator. Its period depends on length and gravity, not on the bob's mass.",
    "assumptions": "Small-angle approximation; point bob, massless string, no damping; amplitude limited to 15°.",
    "question": "What happens to the period when the length becomes four times as large?",
    "answer": "The period doubles.",
    "scope": "Theory"
  },
  {
    "id": "wave",
    "grade": 11,
    "ch": 14,
    "title": "Travelling transverse wave",
    "kind": "3D",
    "params": [
      {
        "key": "A",
        "label": "Amplitude",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "m"
      },
      {
        "key": "lambda",
        "label": "Wavelength",
        "min": 1,
        "max": 4,
        "step": 0.25,
        "value": 2,
        "unit": "m"
      },
      {
        "key": "f",
        "label": "Frequency",
        "min": 0.5,
        "max": 3,
        "step": 0.25,
        "value": 1,
        "unit": "Hz"
      }
    ],
    "equation": "y=A sin(kx−ωt); v=fλ",
    "explain": "The disturbance travels while each marked particle oscillates near its equilibrium position. Wave speed equals frequency multiplied by wavelength.",
    "assumptions": "Ideal nondispersive wave; particles do not drift along propagation direction.",
    "question": "Does the same particle travel along with a crest?",
    "answer": "No. A crest is a moving phase of the wave; the material particle oscillates locally.",
    "scope": "Theory"
  },
  {
    "id": "longitudinal",
    "grade": 11,
    "ch": 14,
    "title": "Longitudinal wave and compression",
    "kind": "3D",
    "params": [
      {
        "key": "A",
        "label": "Displacement amplitude",
        "min": 0.05,
        "max": 0.3,
        "step": 0.05,
        "value": 0.15,
        "unit": "m"
      },
      {
        "key": "lambda",
        "label": "Wavelength",
        "min": 1,
        "max": 4,
        "step": 0.25,
        "value": 2,
        "unit": "m"
      },
      {
        "key": "f",
        "label": "Frequency",
        "min": 0.5,
        "max": 2,
        "step": 0.25,
        "value": 1,
        "unit": "Hz"
      }
    ],
    "equation": "ξ=A sin(kx−ωt); pressure perturbation ∝ −∂ξ/∂x",
    "explain": "Particles oscillate parallel to the direction of wave travel. Regions where particles crowd together are compressions; regions where they spread apart are rarefactions.",
    "assumptions": "1D small-displacement model; particle spacing is illustrative.",
    "question": "Do maximum displacement and maximum pressure occur at the same position?",
    "answer": "No. For a travelling sinusoidal sound wave, they are separated spatially by a quarter wavelength.",
    "scope": "Theory"
  },
  {
    "id": "superposition",
    "grade": 11,
    "ch": 14,
    "title": "Superposition and phase",
    "kind": "2D",
    "params": [
      {
        "key": "phase",
        "label": "Phase difference",
        "min": 0,
        "max": 360,
        "step": 15,
        "value": 90,
        "unit": "°"
      },
      {
        "key": "a",
        "label": "Amplitude 2 / amplitude 1",
        "min": 0,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": ""
      }
    ],
    "equation": "y = y₁ + y₂; A_resultant² = A₁²+A₂²+2A₁A₂cosφ",
    "explain": "Wave displacements add algebraically. The phase difference determines whether the waves reinforce or cancel at a point.",
    "assumptions": "Same frequency and wavelength, same direction; no nonlinear interaction.",
    "question": "What happens for equal waves with a 180-degree phase difference?",
    "answer": "Their displacements cancel completely.",
    "scope": "Theory"
  },
  {
    "id": "standing",
    "grade": 11,
    "ch": 14,
    "title": "Standing waves on a string",
    "kind": "2D",
    "params": [
      {
        "key": "n",
        "label": "Harmonic number",
        "min": 1,
        "max": 6,
        "step": 1,
        "value": 2,
        "unit": ""
      },
      {
        "key": "L",
        "label": "String length",
        "min": 1,
        "max": 4,
        "step": 0.5,
        "value": 2,
        "unit": "m"
      },
      {
        "key": "tension",
        "label": "Tension",
        "min": 10,
        "max": 100,
        "step": 10,
        "value": 40,
        "unit": "N"
      }
    ],
    "equation": "f_n = n√(T/μ)/(2L); y=2A sin(nπx/L)cosωt",
    "explain": "Two opposite travelling waves can create stationary nodes and oscillating antinodes. The fixed-end boundary conditions select the allowed harmonics.",
    "assumptions": "String fixed at both ends; μ=0.01 kg/m; visual time slowed to show vibration.",
    "question": "What happens to the fundamental frequency when the string length doubles?",
    "answer": "It is halved if the wave speed remains unchanged.",
    "scope": "Theory"
  },
  {
    "id": "pipes",
    "grade": 11,
    "ch": 14,
    "title": "Organ pipes and harmonics",
    "kind": "2D",
    "params": [
      {
        "key": "L",
        "label": "Pipe length",
        "min": 0.2,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": "m"
      },
      {
        "key": "n",
        "label": "Mode index",
        "min": 1,
        "max": 4,
        "step": 1,
        "value": 1,
        "unit": ""
      },
      {
        "key": "closed",
        "label": "Boundary: 0 open–open · 1 closed–open",
        "min": 0,
        "max": 1,
        "step": 1,
        "value": 1,
        "unit": ""
      }
    ],
    "equation": "Open: f_n=nv/(2L); closed: f_n=(2n−1)v/(4L)",
    "explain": "A closed end is a displacement node; an open end is a displacement antinode. These boundary conditions determine the permitted resonant frequencies.",
    "assumptions": "Air speed 343 m/s; end correction ignored; plotted quantity is displacement, not pressure.",
    "question": "Why are even multiples of the fundamental absent in an ideal closed-open pipe?",
    "answer": "Only odd multiples satisfy a node at one end and an antinode at the other.",
    "scope": "Theory"
  },
  {
    "id": "beats",
    "grade": 11,
    "ch": 14,
    "title": "Beats",
    "kind": "2D",
    "params": [
      {
        "key": "f1",
        "label": "Frequency 1",
        "min": 10,
        "max": 30,
        "step": 1,
        "value": 20,
        "unit": "Hz"
      },
      {
        "key": "df",
        "label": "Frequency difference",
        "min": 0,
        "max": 5,
        "step": 0.25,
        "value": 1,
        "unit": "Hz"
      }
    ],
    "equation": "f_beat = |f₂−f₁|",
    "explain": "Adding two nearby frequencies produces a slowly varying amplitude. The number of loudness cycles per second equals the frequency difference.",
    "assumptions": "Equal-amplitude coherent mathematical waves; displayed time window 2 s; no audio required.",
    "question": "What happens when the two frequencies are made equal?",
    "answer": "The beat frequency becomes zero, so the slow amplitude variation disappears.",
    "scope": "Theory"
  },
  {
    "id": "coulomb",
    "grade": 12,
    "ch": 1,
    "title": "Coulomb force and superposition",
    "kind": "3D",
    "params": [
      {
        "key": "q1",
        "label": "Charge 1",
        "min": -5,
        "max": 5,
        "step": 1,
        "value": 2,
        "unit": "μC"
      },
      {
        "key": "q2",
        "label": "Charge 2",
        "min": -5,
        "max": 5,
        "step": 1,
        "value": -2,
        "unit": "μC"
      },
      {
        "key": "r",
        "label": "Separation",
        "min": 0.2,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": "m"
      }
    ],
    "equation": "F = kq₁q₂/r²",
    "explain": "Like charges repel and unlike charges attract. The forces on the two charges are equal in magnitude and opposite in direction.",
    "assumptions": "Point charges in vacuum; k=8.988×10⁹ N m²/C²; charge markers are not to scale.",
    "question": "What happens to the force if the separation doubles?",
    "answer": "Its magnitude becomes one quarter of the original value.",
    "scope": "Theory"
  },
  {
    "id": "field",
    "grade": 12,
    "ch": 1,
    "title": "Electric field: two charges",
    "kind": "3D",
    "params": [
      {
        "key": "q1",
        "label": "Left charge",
        "min": -3,
        "max": 3,
        "step": 1,
        "value": 2,
        "unit": "nC"
      },
      {
        "key": "q2",
        "label": "Right charge",
        "min": -3,
        "max": 3,
        "step": 1,
        "value": -2,
        "unit": "nC"
      },
      {
        "key": "d",
        "label": "Separation",
        "min": 1,
        "max": 4,
        "step": 0.5,
        "value": 2,
        "unit": "m"
      }
    ],
    "equation": "E(r) = Σ kqᵢ(r−rᵢ)/|r−rᵢ|³",
    "explain": "At each point, electric-field contributions add as vectors. A field-line tangent gives the direction of force on a positive test charge.",
    "assumptions": "Sampled vector field in a plane; no arrows at charge singularities; arrow lengths normalised for legibility.",
    "question": "What is the field at the midpoint between equal positive charges?",
    "answer": "Zero, because the two equal and opposite contributions cancel there.",
    "scope": "Theory"
  },
  {
    "id": "dipole",
    "grade": 12,
    "ch": 1,
    "title": "Electric dipole and torque",
    "kind": "3D",
    "params": [
      {
        "key": "q",
        "label": "Charge magnitude",
        "min": 1,
        "max": 5,
        "step": 1,
        "value": 2,
        "unit": "μC"
      },
      {
        "key": "d",
        "label": "Separation",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.4,
        "unit": "m"
      },
      {
        "key": "E",
        "label": "Uniform field",
        "min": 10,
        "max": 100,
        "step": 10,
        "value": 50,
        "unit": "N/C"
      },
      {
        "key": "angle",
        "label": "Dipole angle",
        "min": 0,
        "max": 180,
        "step": 5,
        "value": 60,
        "unit": "°"
      }
    ],
    "equation": "p=qd; τ=pE sinθ; U=−pE cosθ",
    "explain": "A uniform electric field can produce zero net force but a nonzero torque on a dipole. The torque tends to align its dipole moment with the field.",
    "assumptions": "Ideal rigid dipole; fixed orientation comparison, not rotational dynamics.",
    "question": "Which orientation is stable equilibrium?",
    "answer": "Alignment with the field, where the potential energy is smallest.",
    "scope": "Theory"
  },
  {
    "id": "flux",
    "grade": 12,
    "ch": 1,
    "title": "Electric flux through a surface",
    "kind": "3D",
    "params": [
      {
        "key": "E",
        "label": "Field strength",
        "min": 10,
        "max": 100,
        "step": 10,
        "value": 50,
        "unit": "N/C"
      },
      {
        "key": "A",
        "label": "Area",
        "min": 0.5,
        "max": 4,
        "step": 0.5,
        "value": 2,
        "unit": "m²"
      },
      {
        "key": "angle",
        "label": "Field to surface normal",
        "min": 0,
        "max": 180,
        "step": 5,
        "value": 45,
        "unit": "°"
      }
    ],
    "equation": "Φ = EA cosθ",
    "explain": "Flux depends on the component of field perpendicular to the surface. The relevant area vector is normal to the plane of the surface.",
    "assumptions": "Uniform field and flat surface; normal defines positive orientation.",
    "question": "What is the flux when the field lies parallel to the surface?",
    "answer": "Zero, because the field is perpendicular to the surface normal.",
    "scope": "Theory"
  },
  {
    "id": "gauss",
    "grade": 12,
    "ch": 1,
    "title": "Gauss’s law: shell, wire and sheet",
    "kind": "3D",
    "params": [
      {
        "key": "shape",
        "label": "Geometry: 0 shell · 1 wire · 2 sheet",
        "min": 0,
        "max": 2,
        "step": 1,
        "value": 0,
        "unit": ""
      },
      {
        "key": "r",
        "label": "Observation distance",
        "min": 0.2,
        "max": 3,
        "step": 0.1,
        "value": 1.5,
        "unit": "m"
      },
      {
        "key": "q",
        "label": "Source strength",
        "min": 1,
        "max": 5,
        "step": 1,
        "value": 2,
        "unit": "nC / nC m⁻¹ / nC m⁻²"
      }
    ],
    "equation": "Shell: E_out=kQ/r², E_in=0; wire: E=λ/(2πε₀r); sheet: E=σ/(2ε₀)",
    "explain": "Symmetry makes Gauss's law useful for calculating fields. A spherical shell, a long wire and an infinite sheet have different distance dependences.",
    "assumptions": "Shell radius 1 m; ideal infinitely long wire/infinite sheet. At shell surface display exterior limit.",
    "question": "Inside a charged shell, are both field and potential zero?",
    "answer": "The field is zero, but the potential is generally a nonzero constant.",
    "scope": "Theory"
  },
  {
    "id": "potential",
    "grade": 12,
    "ch": 2,
    "title": "Potential and equipotentials",
    "kind": "3D",
    "params": [
      {
        "key": "q",
        "label": "Point charge",
        "min": -5,
        "max": 5,
        "step": 1,
        "value": 2,
        "unit": "nC"
      },
      {
        "key": "r",
        "label": "Test distance",
        "min": 0.3,
        "max": 4,
        "step": 0.1,
        "value": 2,
        "unit": "m"
      }
    ],
    "equation": "V=kq/r; E=−dV/dr",
    "explain": "Potential is a scalar, while field is a vector. Moving along an equipotential surface requires no work against the electrostatic force.",
    "assumptions": "Point charge, reference at infinity; concentric rings are sections of equipotential spheres.",
    "question": "How does the potential of a positive point charge change as you move away?",
    "answer": "It decreases toward zero at infinity.",
    "scope": "Theory"
  },
  {
    "id": "capacitor",
    "grade": 12,
    "ch": 2,
    "title": "Capacitor and dielectric",
    "kind": "3D",
    "params": [
      {
        "key": "A",
        "label": "Plate area",
        "min": 10,
        "max": 100,
        "step": 10,
        "value": 50,
        "unit": "cm²"
      },
      {
        "key": "d",
        "label": "Plate separation",
        "min": 1,
        "max": 10,
        "step": 0.5,
        "value": 3,
        "unit": "mm"
      },
      {
        "key": "K",
        "label": "Dielectric constant",
        "min": 1,
        "max": 6,
        "step": 0.5,
        "value": 1,
        "unit": ""
      },
      {
        "key": "mode",
        "label": "0 battery connected · 1 isolated",
        "min": 0,
        "max": 1,
        "step": 1,
        "value": 0,
        "unit": ""
      }
    ],
    "equation": "C=Kε₀A/d; Q=CV; U=½CV²",
    "explain": "A connected battery holds the voltage fixed. An isolated charged capacitor holds its charge fixed. Inserting a dielectric therefore has different effects in the two cases.",
    "assumptions": "Uniform parallel plates; no fringing. Connected V=12 V. Isolated reference charge = 12 C₀ for A=50 cm²,d=3 mm,K=1.",
    "question": "What happens to the voltage when a dielectric is inserted into an isolated capacitor?",
    "answer": "It falls because the capacitance increases while the charge stays fixed.",
    "scope": "Theory"
  },
  {
    "id": "capnetwork",
    "grade": 12,
    "ch": 2,
    "title": "Capacitors in series and parallel",
    "kind": "2D",
    "params": [
      {
        "key": "c1",
        "label": "Capacitor 1",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 3,
        "unit": "μF"
      },
      {
        "key": "c2",
        "label": "Capacitor 2",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 6,
        "unit": "μF"
      },
      {
        "key": "mode",
        "label": "0 series · 1 parallel",
        "min": 0,
        "max": 1,
        "step": 1,
        "value": 0,
        "unit": ""
      }
    ],
    "equation": "Series: 1/C=1/C₁+1/C₂; parallel: C=C₁+C₂",
    "explain": "Capacitors in series carry equal charge magnitudes. Capacitors in parallel share the same voltage. These constraints determine their equivalent capacitance.",
    "assumptions": "Ideal capacitors across 12 V source; steady electrostatic state.",
    "question": "Is a series equivalent capacitance larger or smaller than the smallest capacitor?",
    "answer": "Smaller.",
    "scope": "Theory"
  },
  {
    "id": "drift",
    "grade": 12,
    "ch": 3,
    "title": "Electron drift and current",
    "kind": "3D",
    "params": [
      {
        "key": "E",
        "label": "Electric field",
        "min": 0.1,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": "V/m"
      },
      {
        "key": "tau",
        "label": "Relaxation time",
        "min": 1,
        "max": 5,
        "step": 0.5,
        "value": 2,
        "unit": "×10⁻¹⁴ s"
      },
      {
        "key": "A",
        "label": "Wire area",
        "min": 0.5,
        "max": 3,
        "step": 0.5,
        "value": 1,
        "unit": "mm²"
      }
    ],
    "equation": "v_d=eEτ/m_e; I=neAv_d",
    "explain": "Electrons have a small net drift opposite to conventional current. Random microscopic motion can be much faster than this drift.",
    "assumptions": "Drude model; n=8.5×10²⁸ m⁻³; tracer drift is greatly magnified; collisions schematic.",
    "question": "What happens to current when the cross-sectional area doubles at the same drift speed?",
    "answer": "The current doubles.",
    "scope": "Theory"
  },
  {
    "id": "resistance",
    "grade": 12,
    "ch": 3,
    "title": "Resistance, resistivity and temperature",
    "kind": "3D",
    "params": [
      {
        "key": "L",
        "label": "Wire length",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 5,
        "unit": "m"
      },
      {
        "key": "A",
        "label": "Cross-section",
        "min": 0.5,
        "max": 3,
        "step": 0.5,
        "value": 1,
        "unit": "mm²"
      },
      {
        "key": "T",
        "label": "Temperature",
        "min": 20,
        "max": 120,
        "step": 5,
        "value": 20,
        "unit": "°C"
      }
    ],
    "equation": "R=ρL/A; ρ(T)=ρ₂₀[1+α(T−20)]",
    "explain": "Resistivity describes the material; resistance also depends on the conductor's length and area. In this metal model, resistance increases with temperature.",
    "assumptions": "Copper approximation: ρ₂₀=1.68×10⁻⁸ Ωm, α=0.0039/K; linear temperature model.",
    "question": "Does a thicker wire have more or less resistance if its length and material stay the same?",
    "answer": "Less resistance.",
    "scope": "Theory"
  },
  {
    "id": "circuit",
    "grade": 12,
    "ch": 3,
    "title": "Resistor circuits and power",
    "kind": "2D",
    "params": [
      {
        "key": "r1",
        "label": "Resistance 1",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 4,
        "unit": "Ω"
      },
      {
        "key": "r2",
        "label": "Resistance 2",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 6,
        "unit": "Ω"
      },
      {
        "key": "v",
        "label": "Supply",
        "min": 1,
        "max": 24,
        "step": 1,
        "value": 12,
        "unit": "V"
      },
      {
        "key": "mode",
        "label": "0 series · 1 parallel",
        "min": 0,
        "max": 1,
        "step": 1,
        "value": 0,
        "unit": ""
      }
    ],
    "equation": "V=IR; P=VI; R_series=R₁+R₂; R_parallel=R₁R₂/(R₁+R₂)",
    "explain": "Series components share the same current; parallel branches share the same voltage. Electrical power is the rate at which energy is transferred.",
    "assumptions": "Ideal DC source and ohmic resistors; wire resistance ignored.",
    "question": "What happens to total current when another parallel resistor branch is added?",
    "answer": "It increases for an ideal source holding the voltage constant.",
    "scope": "Theory"
  },
  {
    "id": "cell",
    "grade": 12,
    "ch": 3,
    "title": "Cells and internal resistance",
    "kind": "2D",
    "params": [
      {
        "key": "emf",
        "label": "Cell emf",
        "min": 1,
        "max": 6,
        "step": 0.5,
        "value": 2,
        "unit": "V"
      },
      {
        "key": "r",
        "label": "Internal resistance",
        "min": 0.1,
        "max": 2,
        "step": 0.1,
        "value": 0.5,
        "unit": "Ω"
      },
      {
        "key": "R",
        "label": "Load",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 5,
        "unit": "Ω"
      },
      {
        "key": "n",
        "label": "Identical cells",
        "min": 1,
        "max": 4,
        "step": 1,
        "value": 2,
        "unit": ""
      },
      {
        "key": "mode",
        "label": "0 series · 1 parallel",
        "min": 0,
        "max": 1,
        "step": 1,
        "value": 0,
        "unit": ""
      }
    ],
    "equation": "I=E_eq/(R+r_eq); V_terminal=I R",
    "explain": "A real cell loses some voltage across its internal resistance when current flows. Combining identical cells changes the equivalent emf and internal resistance.",
    "assumptions": "Identical cells, all same polarity; series E_eq=nE,r_eq=nr; parallel E_eq=E,r_eq=r/n.",
    "question": "Why does open-circuit terminal voltage equal the emf?",
    "answer": "No current flows, so there is no internal resistive voltage drop.",
    "scope": "Theory"
  },
  {
    "id": "kirchhoff",
    "grade": 12,
    "ch": 3,
    "title": "Kirchhoff’s junction and loop rules",
    "kind": "2D",
    "params": [
      {
        "key": "v",
        "label": "Supply",
        "min": 1,
        "max": 24,
        "step": 1,
        "value": 12,
        "unit": "V"
      },
      {
        "key": "r0",
        "label": "Shared resistor",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 2,
        "unit": "Ω"
      },
      {
        "key": "r1",
        "label": "Branch 1",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 4,
        "unit": "Ω"
      },
      {
        "key": "r2",
        "label": "Branch 2",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 6,
        "unit": "Ω"
      }
    ],
    "equation": "I_total=I₁+I₂; V−I_total R₀−I₁R₁=0",
    "explain": "The junction rule expresses charge conservation. The loop rule expresses energy conservation. A shared resistor couples the behaviour of parallel branches.",
    "assumptions": "One shared series resistor feeding two parallel branches; ideal DC circuit.",
    "question": "Can changing one branch resistance change the current in another branch?",
    "answer": "Yes. It changes the drop across the shared resistor and therefore the voltage across both branches.",
    "scope": "Theory"
  },
  {
    "id": "wheatstone",
    "grade": 12,
    "ch": 3,
    "title": "Wheatstone bridge balance",
    "kind": "2D",
    "params": [
      {
        "key": "P",
        "label": "Top-left resistance",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 5,
        "unit": "Ω"
      },
      {
        "key": "Q",
        "label": "Bottom-left resistance",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 10,
        "unit": "Ω"
      },
      {
        "key": "R",
        "label": "Top-right resistance",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 5,
        "unit": "Ω"
      },
      {
        "key": "S",
        "label": "Bottom-right resistance",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 10,
        "unit": "Ω"
      }
    ],
    "equation": "Balance: P/Q=R/S; V_detector=V_left−V_right",
    "explain": "A bridge is balanced when its midpoint potentials are equal. The balance depends on resistance ratios, rather than on the source voltage.",
    "assumptions": "12 V supply; detector treated as infinite-resistance voltmeter, so displayed quantity is open-circuit imbalance voltage.",
    "question": "Does changing the source voltage change the ideal balance condition?",
    "answer": "No. The resistance ratios determine balance.",
    "scope": "Theory"
  },
  {
    "id": "magnetic",
    "grade": 12,
    "ch": 4,
    "title": "Charged particle in a magnetic field",
    "kind": "3D",
    "params": [
      {
        "key": "v",
        "label": "Speed",
        "min": 1,
        "max": 8,
        "step": 0.5,
        "value": 3,
        "unit": "×10⁵ m/s"
      },
      {
        "key": "B",
        "label": "Field",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "T"
      },
      {
        "key": "angle",
        "label": "Angle to field",
        "min": 0,
        "max": 90,
        "step": 5,
        "value": 60,
        "unit": "°"
      },
      {
        "key": "sign",
        "label": "Charge sign",
        "min": -1,
        "max": 1,
        "step": 2,
        "value": 1,
        "unit": ""
      }
    ],
    "equation": "F=q(v×B); r=mv⊥/(|q|B); T=2πm/(|q|B)",
    "explain": "Magnetic force is perpendicular to velocity and does no work. The perpendicular velocity component produces a circle; the parallel component carries the particle along the field.",
    "assumptions": "Proton mass, charge ±e, B along +z; no electric field; visual time scaled to cyclotron period.",
    "question": "What paths occur at entry angles of 0, 90 and an intermediate angle?",
    "answer": "Straight motion, circular motion and helical motion respectively.",
    "scope": "Theory"
  },
  {
    "id": "wire",
    "grade": 12,
    "ch": 4,
    "title": "Field around a straight wire",
    "kind": "3D",
    "params": [
      {
        "key": "I",
        "label": "Current",
        "min": -10,
        "max": 10,
        "step": 1,
        "value": 5,
        "unit": "A"
      },
      {
        "key": "r",
        "label": "Observation radius",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "m"
      }
    ],
    "equation": "B=μ₀I/(2πr)",
    "explain": "The magnetic field circles a straight current-carrying wire. Point your right thumb along conventional current to find the field direction with your curled fingers.",
    "assumptions": "Infinitely long thin wire; sampled plane field; reversal changes circulation.",
    "question": "What happens when the current reverses?",
    "answer": "The magnetic field reverses its circulation.",
    "scope": "Theory"
  },
  {
    "id": "loop",
    "grade": 12,
    "ch": 4,
    "title": "Circular loop: axial magnetic field",
    "kind": "3D",
    "params": [
      {
        "key": "I",
        "label": "Current",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 5,
        "unit": "A"
      },
      {
        "key": "R",
        "label": "Loop radius",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "m"
      },
      {
        "key": "x",
        "label": "Axial distance",
        "min": 0,
        "max": 2,
        "step": 0.1,
        "value": 0.5,
        "unit": "m"
      }
    ],
    "equation": "B_axis=μ₀IR²/[2(R²+x²)^(3/2)]",
    "explain": "The fields from different parts of a circular current loop add on its axis. Their transverse components cancel by symmetry.",
    "assumptions": "Single thin circular loop in vacuum; field readout only on its axis.",
    "question": "What happens to the central field when the loop radius doubles at fixed current?",
    "answer": "It is halved.",
    "scope": "Theory"
  },
  {
    "id": "solenoid",
    "grade": 12,
    "ch": 4,
    "title": "Solenoid and magnetic-field direction",
    "kind": "3D",
    "params": [
      {
        "key": "I",
        "label": "Current",
        "min": -5,
        "max": 5,
        "step": 1,
        "value": 2,
        "unit": "A"
      },
      {
        "key": "n",
        "label": "Turns per metre",
        "min": 100,
        "max": 1000,
        "step": 100,
        "value": 500,
        "unit": "m⁻¹"
      }
    ],
    "equation": "Long-solenoid estimate: B≈μ₀nI",
    "explain": "The fields of neighbouring turns reinforce inside a long solenoid. Reversing the current reverses the field and interchanges the magnetic poles.",
    "assumptions": "Qualitative field geometry; numeric estimate assumes a long air-core solenoid; end effects not calculated.",
    "question": "What happens to the long-solenoid field if the turns per metre double?",
    "answer": "It doubles for the same current and core material.",
    "scope": "Theory"
  },
  {
    "id": "parallel",
    "grade": 12,
    "ch": 4,
    "title": "Force between parallel currents",
    "kind": "3D",
    "params": [
      {
        "key": "i1",
        "label": "Current 1",
        "min": -10,
        "max": 10,
        "step": 1,
        "value": 5,
        "unit": "A"
      },
      {
        "key": "i2",
        "label": "Current 2",
        "min": -10,
        "max": 10,
        "step": 1,
        "value": 5,
        "unit": "A"
      },
      {
        "key": "d",
        "label": "Separation",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "m"
      }
    ],
    "equation": "F/L=μ₀I₁I₂/(2πd)",
    "explain": "Parallel currents in the same direction attract. Currents in opposite directions repel. Each wire experiences the field made by the other.",
    "assumptions": "Infinitely long parallel wires; force per unit length.",
    "question": "What happens if only one of the currents is reversed?",
    "answer": "Attraction becomes repulsion, or repulsion becomes attraction.",
    "scope": "Theory"
  },
  {
    "id": "looptorque",
    "grade": 12,
    "ch": 4,
    "title": "Current loop torque and galvanometer",
    "kind": "3D",
    "params": [
      {
        "key": "I",
        "label": "Current",
        "min": 0.01,
        "max": 0.1,
        "step": 0.01,
        "value": 0.05,
        "unit": "A"
      },
      {
        "key": "B",
        "label": "Field",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "T"
      },
      {
        "key": "angle",
        "label": "Normal to field angle",
        "min": 0,
        "max": 180,
        "step": 5,
        "value": 60,
        "unit": "°"
      }
    ],
    "equation": "τ=NIAB sinθ; radial-field galvanometer: κθ=NIAB",
    "explain": "A current loop behaves as a magnetic dipole. A uniform field produces an orientation-dependent torque; a radial-field galvanometer is arranged to make the torque proportional to current.",
    "assumptions": "N=20,A=0.01 m². Loop view uses uniform field; separate galvanometer estimate κ=0.001 N m/rad.",
    "question": "How is a galvanometer converted into an ammeter?",
    "answer": "Connect a low-resistance shunt in parallel. A voltmeter instead uses a high series resistance.",
    "scope": "Theory"
  },
  {
    "id": "galvanometer",
    "grade": 12,
    "ch": 4,
    "title": "Galvanometer conversion",
    "kind": "2D",
    "params": [
      {
        "key": "G",
        "label": "Coil resistance",
        "min": 10,
        "max": 100,
        "step": 10,
        "value": 50,
        "unit": "Ω"
      },
      {
        "key": "Ig",
        "label": "Full-scale coil current",
        "min": 0.1,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": "mA"
      },
      {
        "key": "range",
        "label": "Target range",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 5,
        "unit": "A or V"
      },
      {
        "key": "mode",
        "label": "0 ammeter · 1 voltmeter",
        "min": 0,
        "max": 1,
        "step": 1,
        "value": 0,
        "unit": ""
      }
    ],
    "equation": "Shunt S=I_gG/(I−I_g); series R=V/I_g−G",
    "explain": "A shunt carries most of the current in an ammeter. A large series resistance limits the current in a voltmeter.",
    "assumptions": "Ideal full-scale conversion; meter itself not ideal zero/infinite impedance.",
    "question": "Why is a voltmeter connected in parallel?",
    "answer": "It measures the potential difference between two points.",
    "scope": "Theory"
  },
  {
    "id": "bar",
    "grade": 12,
    "ch": 5,
    "title": "Bar magnet and dipole field",
    "kind": "3D",
    "params": [
      {
        "key": "angle",
        "label": "Magnet orientation",
        "min": 0,
        "max": 180,
        "step": 10,
        "value": 0,
        "unit": "°"
      }
    ],
    "equation": "Magnetic field lines form closed loops",
    "explain": "Magnetic field lines form closed loops. Outside a bar magnet they run from north to south, with the return path inside the magnet.",
    "assumptions": "Qualitative field-line schematic, not a finite-magnet field solver; internal return path is included.",
    "question": "Where do magnetic field lines start and end?",
    "answer": "They do not have isolated beginnings or ends: they form closed loops.",
    "scope": "Theory"
  },
  {
    "id": "materials",
    "grade": 12,
    "ch": 5,
    "title": "Dia-, para- and ferromagnetism",
    "kind": "3D",
    "params": [
      {
        "key": "type",
        "label": "0 diamagnetic · 1 paramagnetic · 2 ferromagnetic",
        "min": 0,
        "max": 2,
        "step": 1,
        "value": 1,
        "unit": ""
      },
      {
        "key": "field",
        "label": "Applied field",
        "min": 0,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "relative"
      },
      {
        "key": "T",
        "label": "Temperature",
        "min": 100,
        "max": 1000,
        "step": 50,
        "value": 300,
        "unit": "K"
      }
    ],
    "equation": "Diamagnetic χ<0; paramagnetic χ>0; ferro: domain alignment",
    "explain": "Magnetic response depends on microscopic moments and their alignment. Diamagnetic, paramagnetic and ferromagnetic materials respond differently to an applied field.",
    "assumptions": "Qualitative dipole/domain illustration. Not a material-specific susceptibility, Curie-temperature or hysteresis solver.",
    "question": "In which direction is the induced diamagnetic response?",
    "answer": "Opposite to the applied field.",
    "scope": "Theory"
  },
  {
    "id": "faraday",
    "grade": 12,
    "ch": 6,
    "title": "Faraday’s law and Lenz’s law",
    "kind": "3D",
    "params": [
      {
        "key": "B",
        "label": "Field amplitude",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "T"
      },
      {
        "key": "f",
        "label": "Field frequency",
        "min": 0.2,
        "max": 2,
        "step": 0.2,
        "value": 1,
        "unit": "Hz"
      },
      {
        "key": "N",
        "label": "Turns",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 10,
        "unit": ""
      }
    ],
    "equation": "Φ=BA; ε=−N dΦ/dt",
    "explain": "An emf is induced when magnetic flux linkage changes. Changing field strength, loop area or orientation can change the flux. The induced response opposes the change, not necessarily the field itself.",
    "assumptions": "Stationary loop area 0.05 m²; uniform sinusoidal external field; resistance 10 Ω; self-inductance neglected.",
    "question": "Can a constant nonzero flux produce a steady induced emf?",
    "answer": "No. The flux linkage must change with time.",
    "scope": "Theory"
  },
  {
    "id": "motional",
    "grade": 12,
    "ch": 6,
    "title": "Motional EMF",
    "kind": "3D",
    "params": [
      {
        "key": "B",
        "label": "Magnetic field",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "T"
      },
      {
        "key": "L",
        "label": "Rod length",
        "min": 0.2,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": "m"
      },
      {
        "key": "v",
        "label": "Rod speed",
        "min": 0.5,
        "max": 5,
        "step": 0.5,
        "value": 2,
        "unit": "m/s"
      }
    ],
    "equation": "ε=BLv; I=ε/R; F=BIL",
    "explain": "A moving conductor separates charges through magnetic force. If the circuit is closed, the resulting current produces a drag force that opposes the motion.",
    "assumptions": "Rod slides on ideal rails; R=5 Ω; perpendicular field; external drive keeps speed constant.",
    "question": "How are mechanical input power and electrical power related?",
    "answer": "In this ideal model, Fv equals emf times current, which equals the resistive heating power.",
    "scope": "Theory"
  },
  {
    "id": "self",
    "grade": 12,
    "ch": 6,
    "title": "Self-induction: RL switching",
    "kind": "2D",
    "params": [
      {
        "key": "L",
        "label": "Inductance",
        "min": 0.1,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": "H"
      },
      {
        "key": "R",
        "label": "Resistance",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 5,
        "unit": "Ω"
      },
      {
        "key": "V",
        "label": "Supply",
        "min": 1,
        "max": 12,
        "step": 1,
        "value": 6,
        "unit": "V"
      }
    ],
    "equation": "I=(V/R)(1−e^(−Rt/L)); ε_L=−L dI/dt",
    "explain": "An inductor opposes a change in current. After a DC source is connected to an RL circuit, current approaches its final value gradually.",
    "assumptions": "Ideal RL step response; switch closes at t=0; no capacitance or core saturation.",
    "question": "What happens to the current rise when inductance increases?",
    "answer": "It becomes slower because the time constant is L divided by R.",
    "scope": "Theory"
  },
  {
    "id": "mutual",
    "grade": 12,
    "ch": 6,
    "title": "Mutual induction",
    "kind": "3D",
    "params": [
      {
        "key": "M",
        "label": "Mutual inductance",
        "min": 0.01,
        "max": 0.2,
        "step": 0.01,
        "value": 0.1,
        "unit": "H"
      },
      {
        "key": "I",
        "label": "Primary current amplitude",
        "min": 0.5,
        "max": 3,
        "step": 0.5,
        "value": 1,
        "unit": "A"
      },
      {
        "key": "f",
        "label": "Frequency",
        "min": 0.5,
        "max": 3,
        "step": 0.5,
        "value": 1,
        "unit": "Hz"
      }
    ],
    "equation": "ε₂=−M dI₁/dt",
    "explain": "A changing primary current changes the magnetic flux linked with a second coil. The linked fraction depends on geometry. The secondary develops an emf; a current flows only if its circuit is closed.",
    "assumptions": "Fixed mutual inductance; secondary open circuit; no load back-reaction.",
    "question": "What happens to the secondary emf when the primary current becomes steady?",
    "answer": "It becomes zero. A steady primary current produces a steady field, not a changing flux linkage.",
    "scope": "Theory"
  },
  {
    "id": "ac",
    "grade": 12,
    "ch": 7,
    "title": "AC phase, RMS and power",
    "kind": "2D",
    "params": [
      {
        "key": "type",
        "label": "0 resistor · 1 inductor · 2 capacitor",
        "min": 0,
        "max": 2,
        "step": 1,
        "value": 0,
        "unit": ""
      },
      {
        "key": "V",
        "label": "Peak voltage",
        "min": 10,
        "max": 100,
        "step": 10,
        "value": 50,
        "unit": "V"
      },
      {
        "key": "f",
        "label": "Frequency",
        "min": 20,
        "max": 100,
        "step": 10,
        "value": 50,
        "unit": "Hz"
      }
    ],
    "equation": "V_rms=V₀/√2; P_avg=V_rms I_rms cosφ",
    "explain": "Voltage and current are in phase for an ideal resistor. Current lags voltage in an inductor and leads voltage in a capacitor.",
    "assumptions": "Ideal R=10 Ω,L=0.1 H,C=100 μF, one selected component. Visual cycle slowed.",
    "question": "What is the average power absorbed by an ideal inductor?",
    "answer": "Zero over a complete cycle: stored magnetic energy is returned to the source.",
    "scope": "Theory"
  },
  {
    "id": "resonance",
    "grade": 12,
    "ch": 7,
    "title": "Series LCR resonance and phasors",
    "kind": "2D",
    "params": [
      {
        "key": "R",
        "label": "Resistance",
        "min": 5,
        "max": 50,
        "step": 5,
        "value": 10,
        "unit": "Ω"
      },
      {
        "key": "L",
        "label": "Inductance",
        "min": 0.05,
        "max": 0.5,
        "step": 0.05,
        "value": 0.1,
        "unit": "H"
      },
      {
        "key": "C",
        "label": "Capacitance",
        "min": 10,
        "max": 200,
        "step": 10,
        "value": 100,
        "unit": "μF"
      },
      {
        "key": "f",
        "label": "Frequency",
        "min": 10,
        "max": 200,
        "step": 5,
        "value": 50,
        "unit": "Hz"
      }
    ],
    "equation": "Z=√[R²+(ωL−1/ωC)²]; f₀=1/(2π√LC)",
    "explain": "In a series LCR circuit, inductive and capacitive reactances cancel at resonance. The impedance is then purely resistive.",
    "assumptions": "Ideal series circuit; 10 V rms; steady state, not transient switching.",
    "question": "How does reducing resistance change the resonance curve?",
    "answer": "The peak current increases and the resonance becomes sharper.",
    "scope": "Theory"
  },
  {
    "id": "generator",
    "grade": 12,
    "ch": 7,
    "title": "AC generator",
    "kind": "3D",
    "params": [
      {
        "key": "B",
        "label": "Field",
        "min": 0.1,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": "T"
      },
      {
        "key": "f",
        "label": "Rotation frequency",
        "min": 0.5,
        "max": 3,
        "step": 0.5,
        "value": 1,
        "unit": "Hz"
      },
      {
        "key": "N",
        "label": "Turns",
        "min": 10,
        "max": 100,
        "step": 10,
        "value": 50,
        "unit": ""
      }
    ],
    "equation": "Φ=BA cosωt; ε=NBAω sinωt",
    "explain": "Rotating a coil in a magnetic field changes its flux linkage. Uniform rotation produces a sinusoidal emf in the ideal generator.",
    "assumptions": "Coil area 0.02 m²; uniform field; ideal open circuit; slip rings not mechanically resolved.",
    "question": "What happens to peak emf when rotation frequency doubles?",
    "answer": "It doubles for the same field, coil area and number of turns.",
    "scope": "Theory"
  },
  {
    "id": "transformer",
    "grade": 12,
    "ch": 7,
    "title": "Ideal transformer",
    "kind": "3D",
    "params": [
      {
        "key": "n1",
        "label": "Primary turns",
        "min": 100,
        "max": 500,
        "step": 50,
        "value": 200,
        "unit": ""
      },
      {
        "key": "n2",
        "label": "Secondary turns",
        "min": 100,
        "max": 1000,
        "step": 50,
        "value": 400,
        "unit": ""
      },
      {
        "key": "v",
        "label": "Primary RMS voltage",
        "min": 10,
        "max": 100,
        "step": 10,
        "value": 20,
        "unit": "V"
      },
      {
        "key": "R",
        "label": "Secondary load",
        "min": 10,
        "max": 100,
        "step": 10,
        "value": 50,
        "unit": "Ω"
      }
    ],
    "equation": "V₂/V₁=N₂/N₁; V₁I₁=V₂I₂",
    "explain": "The turns ratio changes the AC voltage. An ideal transformer conserves power, so increasing voltage decreases current for a given transferred power.",
    "assumptions": "Ideal AC transformer; no copper/core loss or leakage; constant rms values.",
    "question": "Does a step-up transformer provide more power than it receives?",
    "answer": "No. In the ideal case output and input power are equal; real transformers have losses.",
    "scope": "Theory"
  },
  {
    "id": "em",
    "grade": 12,
    "ch": 8,
    "title": "Electromagnetic wave geometry",
    "kind": "3D",
    "params": [
      {
        "key": "lambda",
        "label": "Illustrative wavelength",
        "min": 1,
        "max": 4,
        "step": 0.5,
        "value": 2,
        "unit": "m"
      },
      {
        "key": "A",
        "label": "Electric-field amplitude",
        "min": 1,
        "max": 5,
        "step": 1,
        "value": 2,
        "unit": "V/m"
      }
    ],
    "equation": "E ⟂ B ⟂ propagation; E₀=cB₀; c=fλ",
    "explain": "The electric field, magnetic field and propagation direction are mutually perpendicular in a plane electromagnetic wave. The two fields vary in phase in vacuum.",
    "assumptions": "Plane monochromatic vacuum wave. B is visually rescaled; animation vastly slowed, not real-time light propagation.",
    "question": "Does the wave travel along its electric field direction?",
    "answer": "No. It travels perpendicular to both fields, in the direction of the cross product of E and B.",
    "scope": "Theory"
  },
  {
    "id": "spectrum",
    "grade": 12,
    "ch": 8,
    "title": "Electromagnetic spectrum",
    "kind": "2D",
    "params": [
      {
        "key": "logf",
        "label": "log₁₀ frequency",
        "min": 3,
        "max": 22,
        "step": 0.1,
        "value": 14,
        "unit": ""
      }
    ],
    "equation": "c=fλ; photon energy=hf",
    "explain": "All electromagnetic waves share the same underlying nature. Frequency determines wavelength in vacuum and the energy of each photon.",
    "assumptions": "Band boundaries are approximate conventions; examples are illustrative, not exclusive uses.",
    "question": "What happens to wavelength and photon energy when frequency increases?",
    "answer": "Wavelength decreases while photon energy increases.",
    "scope": "Theory"
  },
  {
    "id": "lens",
    "grade": 12,
    "ch": 9,
    "title": "Thin-lens image formation",
    "kind": "2D",
    "params": [
      {
        "key": "f",
        "label": "Focal length",
        "min": -5,
        "max": 5,
        "step": 1,
        "value": 2,
        "unit": "cm"
      },
      {
        "key": "u",
        "label": "Object distance magnitude",
        "min": 1,
        "max": 12,
        "step": 0.5,
        "value": 6,
        "unit": "cm"
      }
    ],
    "equation": "1/v−1/u_signed=1/f; m=v/u_signed",
    "explain": "The position of the object relative to the focal points determines the image. A converging lens can make either a real inverted image or a virtual upright image.",
    "assumptions": "Paraxial thin lens; object on left, u_signed<0; f=0 is an invalid lens and is explicitly flagged.",
    "question": "What happens when an object is placed inside the focal length of a converging lens?",
    "answer": "The image is virtual, upright and magnified.",
    "scope": "Theory"
  },
  {
    "id": "mirror",
    "grade": 12,
    "ch": 9,
    "title": "Spherical-mirror image formation",
    "kind": "2D",
    "params": [
      {
        "key": "f",
        "label": "Focal length: − concave / + convex",
        "min": -5,
        "max": 5,
        "step": 1,
        "value": -2,
        "unit": "cm"
      },
      {
        "key": "u",
        "label": "Object distance magnitude",
        "min": 1,
        "max": 12,
        "step": 0.5,
        "value": 6,
        "unit": "cm"
      }
    ],
    "equation": "1/v+1/u_signed=1/f; m=−v/u_signed",
    "explain": "Apply the Cartesian sign convention consistently when locating a mirror image. The sign of magnification distinguishes upright and inverted images.",
    "assumptions": "Paraxial spherical mirror; object on left, u_signed<0; f=0 invalid.",
    "question": "What kind of image does a convex mirror make of a real object?",
    "answer": "A virtual, upright and diminished image.",
    "scope": "Theory"
  },
  {
    "id": "refraction",
    "grade": 12,
    "ch": 9,
    "title": "Refraction and total internal reflection",
    "kind": "2D",
    "params": [
      {
        "key": "n1",
        "label": "Incident refractive index",
        "min": 1,
        "max": 2,
        "step": 0.1,
        "value": 1.5,
        "unit": ""
      },
      {
        "key": "n2",
        "label": "Second refractive index",
        "min": 1,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": ""
      },
      {
        "key": "angle",
        "label": "Incidence to normal",
        "min": 0,
        "max": 85,
        "step": 1,
        "value": 40,
        "unit": "°"
      }
    ],
    "equation": "n₁ sin i=n₂ sin r; sin i_c=n₂/n₁ (n₁>n₂)",
    "explain": "A ray bends because its propagation speed changes across a boundary. Total internal reflection is possible only from a higher-index medium toward a lower-index medium.",
    "assumptions": "Plane interface; geometric optics; reflected-ray brightness is not a Fresnel intensity calculation.",
    "question": "Can light undergo total internal reflection when entering glass from air?",
    "answer": "No. The incident medium must have the higher refractive index.",
    "scope": "Theory"
  },
  {
    "id": "prism",
    "grade": 12,
    "ch": 9,
    "title": "Prism at minimum deviation",
    "kind": "2D",
    "params": [
      {
        "key": "A",
        "label": "Prism angle",
        "min": 20,
        "max": 70,
        "step": 5,
        "value": 60,
        "unit": "°"
      },
      {
        "key": "n",
        "label": "Refractive index",
        "min": 1.2,
        "max": 1.8,
        "step": 0.05,
        "value": 1.5,
        "unit": ""
      }
    ],
    "equation": "δ_min=2 asin[n sin(A/2)]−A",
    "explain": "At minimum deviation, the ray passes symmetrically through the prism. The internal refraction angles are both half the prism angle.",
    "assumptions": "Air surrounding prism; monochromatic ray; settings requiring sin i>1 are flagged, not plotted as a transmitting ray.",
    "question": "How does increasing refractive index affect minimum deviation?",
    "answer": "It generally increases it, while a transmitting minimum-deviation path remains possible.",
    "scope": "Theory"
  },
  {
    "id": "lensmaker",
    "grade": 12,
    "ch": 9,
    "title": "Lensmaker’s formula and lens combinations",
    "kind": "2D",
    "params": [
      {
        "key": "n",
        "label": "Lens index",
        "min": 1.2,
        "max": 1.8,
        "step": 0.05,
        "value": 1.5,
        "unit": ""
      },
      {
        "key": "r1",
        "label": "R₁",
        "min": 5,
        "max": 30,
        "step": 1,
        "value": 10,
        "unit": "cm"
      },
      {
        "key": "r2",
        "label": "R₂",
        "min": -30,
        "max": -5,
        "step": 1,
        "value": -10,
        "unit": "cm"
      },
      {
        "key": "p2",
        "label": "Second lens power",
        "min": -10,
        "max": 10,
        "step": 1,
        "value": 0,
        "unit": "D"
      }
    ],
    "equation": "1/f=(n−1)(1/R₁−1/R₂); P_total=P₁+P₂",
    "explain": "Surface curvature and refractive index determine the power of a thin lens. For thin lenses in contact, their powers add algebraically.",
    "assumptions": "Thin biconvex first lens in air; second ideal thin lens in contact; radii use Cartesian signs.",
    "question": "What happens when equal positive and negative powers are combined?",
    "answer": "The net power is zero and the equivalent focal length is infinite.",
    "scope": "Theory"
  },
  {
    "id": "microscope",
    "grade": 12,
    "ch": 9,
    "title": "Compound microscope",
    "kind": "2D",
    "params": [
      {
        "key": "fo",
        "label": "Objective focal length",
        "min": 0.5,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": "cm"
      },
      {
        "key": "fe",
        "label": "Eyepiece focal length",
        "min": 2,
        "max": 6,
        "step": 0.5,
        "value": 4,
        "unit": "cm"
      },
      {
        "key": "L",
        "label": "Optical tube length",
        "min": 10,
        "max": 25,
        "step": 1,
        "value": 16,
        "unit": "cm"
      }
    ],
    "equation": "Normal adjustment: M≈−(L/f_o)(D/f_e)",
    "explain": "The objective forms a real magnified intermediate image. The eyepiece acts as a magnifier to increase the apparent angular size of that image.",
    "assumptions": "Schematic ray layout; normal adjustment, D=25 cm; L≫f_o approximation. Diagram positions are not a scaled optical prescription.",
    "question": "How does reducing the objective focal length affect magnification in this model?",
    "answer": "It increases the magnitude of magnification.",
    "scope": "Theory"
  },
  {
    "id": "telescope",
    "grade": 12,
    "ch": 9,
    "title": "Astronomical telescope",
    "kind": "2D",
    "params": [
      {
        "key": "fo",
        "label": "Objective focal length",
        "min": 40,
        "max": 150,
        "step": 10,
        "value": 100,
        "unit": "cm"
      },
      {
        "key": "fe",
        "label": "Eyepiece focal length",
        "min": 2,
        "max": 10,
        "step": 1,
        "value": 5,
        "unit": "cm"
      },
      {
        "key": "reflect",
        "label": "0 refracting · 1 reflecting objective",
        "min": 0,
        "max": 1,
        "step": 1,
        "value": 0,
        "unit": ""
      }
    ],
    "equation": "Normal adjustment: M=−f_o/f_e",
    "explain": "The objective forms an image of a distant object near its focal plane. The eyepiece converts this into a larger apparent angular view.",
    "assumptions": "Schematic normal-adjustment layout; reflecting mode shows a folded light path, not a detailed telescope design.",
    "question": "What happens if the objective focal length increases while the eyepiece is unchanged?",
    "answer": "The magnitude of angular magnification increases.",
    "scope": "Theory"
  },
  {
    "id": "huygens",
    "grade": 12,
    "ch": 10,
    "title": "Huygens wavefronts",
    "kind": "2D",
    "params": [
      {
        "key": "n1",
        "label": "Medium 1 index",
        "min": 1,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "unit": ""
      },
      {
        "key": "n2",
        "label": "Medium 2 index",
        "min": 1,
        "max": 2,
        "step": 0.1,
        "value": 1.5,
        "unit": ""
      },
      {
        "key": "angle",
        "label": "Incidence",
        "min": 0,
        "max": 70,
        "step": 5,
        "value": 30,
        "unit": "°"
      }
    ],
    "equation": "sin i/sin r=v₁/v₂=n₂/n₁",
    "explain": "Each point on a wavefront can be treated as a source of secondary wavelets. Their common envelope gives the next wavefront and explains how a wave changes direction at a boundary.",
    "assumptions": "Plane monochromatic wave; wavelet construction schematic; TIR flagged separately.",
    "question": "What happens to wavelength when light enters a slower medium?",
    "answer": "It decreases. Frequency stays unchanged at the boundary.",
    "scope": "Theory"
  },
  {
    "id": "interference",
    "grade": 12,
    "ch": 10,
    "title": "Young’s double-slit interference",
    "kind": "2D",
    "params": [
      {
        "key": "lambda",
        "label": "Wavelength",
        "min": 400,
        "max": 700,
        "step": 10,
        "value": 550,
        "unit": "nm"
      },
      {
        "key": "d",
        "label": "Slit separation",
        "min": 0.1,
        "max": 1,
        "step": 0.05,
        "value": 0.5,
        "unit": "mm"
      },
      {
        "key": "D",
        "label": "Screen distance",
        "min": 0.5,
        "max": 3,
        "step": 0.1,
        "value": 1,
        "unit": "m"
      }
    ],
    "equation": "β=λD/d; I=4I₀ cos²(πdy/λD)",
    "explain": "Coherent light from the two slits reaches each screen position with a path difference. This creates alternating bright and dark interference fringes.",
    "assumptions": "Equal narrow slits; far-field/small-angle approximation; diffraction envelope ignored.",
    "question": "What happens to fringe spacing if the slit separation doubles?",
    "answer": "It is halved in the small-angle far-field approximation.",
    "scope": "Theory"
  },
  {
    "id": "diffraction",
    "grade": 12,
    "ch": 10,
    "title": "Single-slit diffraction",
    "kind": "2D",
    "params": [
      {
        "key": "lambda",
        "label": "Wavelength",
        "min": 400,
        "max": 700,
        "step": 10,
        "value": 550,
        "unit": "nm"
      },
      {
        "key": "a",
        "label": "Slit width",
        "min": 0.05,
        "max": 0.5,
        "step": 0.01,
        "value": 0.1,
        "unit": "mm"
      },
      {
        "key": "D",
        "label": "Screen distance",
        "min": 0.5,
        "max": 3,
        "step": 0.1,
        "value": 1,
        "unit": "m"
      }
    ],
    "equation": "I/I₀=(sinβ/β)²; β=πay/(λD); central width≈2λD/a",
    "explain": "Different parts of a finite slit contribute waves that interfere. A narrower slit gives a broader central diffraction maximum.",
    "assumptions": "Fraunhofer scalar model; intensity formula shown as enrichment, while syllabus treatment is qualitative.",
    "question": "What happens to the central maximum width if the slit width is halved?",
    "answer": "It approximately doubles in the far field.",
    "scope": "Theory"
  },
  {
    "id": "photoelectric",
    "grade": 12,
    "ch": 11,
    "title": "Photoelectric effect",
    "kind": "2D",
    "params": [
      {
        "key": "f",
        "label": "Light frequency",
        "min": 3,
        "max": 12,
        "step": 0.25,
        "value": 7,
        "unit": "×10¹⁴ Hz"
      },
      {
        "key": "phi",
        "label": "Work function",
        "min": 1,
        "max": 4,
        "step": 0.1,
        "value": 2,
        "unit": "eV"
      },
      {
        "key": "intensity",
        "label": "Relative intensity",
        "min": 0,
        "max": 1,
        "step": 0.1,
        "value": 0.5,
        "unit": ""
      }
    ],
    "equation": "K_max=hf−φ; eV_s=K_max; f₀=φ/h",
    "explain": "Above threshold, increasing frequency increases the maximum electron kinetic energy. Intensity mainly changes the number of emitted electrons, not their maximum energy.",
    "assumptions": "Ideal single-photon effect; emission-count animation illustrative; no multiphoton or detailed photocurrent model.",
    "question": "Can increasing intensity produce emission below threshold in this model?",
    "answer": "No. Each photon must have enough energy to overcome the work function.",
    "scope": "Theory"
  },
  {
    "id": "debroglie",
    "grade": 12,
    "ch": 11,
    "title": "de Broglie matter wavelength",
    "kind": "2D",
    "params": [
      {
        "key": "V",
        "label": "Electron accelerating voltage",
        "min": 10,
        "max": 1000,
        "step": 10,
        "value": 150,
        "unit": "V"
      }
    ],
    "equation": "λ=h/p=h/√(2m_e eV)",
    "explain": "A particle's de Broglie wavelength is inversely proportional to its momentum. Increasing an electron's accelerating voltage gives a shorter wavelength.",
    "assumptions": "Electron starts approximately at rest; nonrelativistic approximation at ≤1 keV; drawn wave is rescaled.",
    "question": "What happens to wavelength when the accelerating voltage becomes four times as large?",
    "answer": "It is halved in the nonrelativistic approximation.",
    "scope": "Theory"
  },
  {
    "id": "rutherford",
    "grade": 12,
    "ch": 12,
    "title": "Rutherford scattering",
    "kind": "2D",
    "params": [
      {
        "key": "b",
        "label": "Impact parameter",
        "min": 5,
        "max": 100,
        "step": 5,
        "value": 30,
        "unit": "fm"
      },
      {
        "key": "E",
        "label": "Alpha energy",
        "min": 2,
        "max": 10,
        "step": 0.5,
        "value": 5,
        "unit": "MeV"
      }
    ],
    "equation": "tan(θ/2)=k Z₁Z₂e²/(2Eb)",
    "explain": "Small impact parameters produce stronger Coulomb deflection. Most alpha particles pass far from the tiny nucleus and are deflected only slightly.",
    "assumptions": "Gold target Z=79, alpha Z=2; fixed point nucleus, pure Coulomb elastic scattering. Diagram is an asymptote schematic, not integrated trajectory.",
    "question": "Which encounters are most likely to give large deflections?",
    "answer": "Those with small impact parameters.",
    "scope": "Theory"
  },
  {
    "id": "bohr",
    "grade": 12,
    "ch": 12,
    "title": "Bohr levels and hydrogen spectrum",
    "kind": "3D",
    "params": [
      {
        "key": "ni",
        "label": "Initial n",
        "min": 2,
        "max": 6,
        "step": 1,
        "value": 3,
        "unit": ""
      },
      {
        "key": "nf",
        "label": "Final n",
        "min": 1,
        "max": 5,
        "step": 1,
        "value": 2,
        "unit": ""
      }
    ],
    "equation": "E_n=−13.6/n² eV; r_n=a₀n²; |ΔE|=hc/λ",
    "explain": "Hydrogen has discrete allowed energies. A downward transition emits a photon whose energy equals the difference between the two levels; an upward transition requires absorption.",
    "assumptions": "Historical Bohr model, not a literal quantum electron orbit. Equal levels give no transition; upward transitions require absorption.",
    "question": "How does a bound electron's energy change as n increases?",
    "answer": "It becomes less negative and approaches zero at ionisation.",
    "scope": "Theory"
  },
  {
    "id": "nucleus",
    "grade": 12,
    "ch": 13,
    "title": "Nuclear size and composition",
    "kind": "3D",
    "params": [
      {
        "key": "A",
        "label": "Mass number",
        "min": 4,
        "max": 200,
        "step": 4,
        "value": 56,
        "unit": ""
      },
      {
        "key": "Z",
        "label": "Proton number",
        "min": 2,
        "max": 80,
        "step": 2,
        "value": 26,
        "unit": ""
      }
    ],
    "equation": "R≈r₀ A^(1/3); N=A−Z",
    "explain": "A nucleus contains protons and neutrons. Its radius grows approximately with the cube root of its nucleon count, reflecting roughly constant nuclear density.",
    "assumptions": "r₀=1.2 fm; nucleon positions are schematic; selected A,Z are not guaranteed stable isotopes; Z>A flagged.",
    "question": "What happens to radius if the mass number becomes eight times as large?",
    "answer": "The estimated radius doubles.",
    "scope": "Theory"
  },
  {
    "id": "binding",
    "grade": 12,
    "ch": 13,
    "title": "Mass defect and binding energy",
    "kind": "2D",
    "params": [
      {
        "key": "dm",
        "label": "Mass defect",
        "min": 0.01,
        "max": 2,
        "step": 0.01,
        "value": 0.5,
        "unit": "u"
      },
      {
        "key": "A",
        "label": "Nucleon count",
        "min": 2,
        "max": 200,
        "step": 2,
        "value": 56,
        "unit": ""
      }
    ],
    "equation": "B=Δmc²; 1 u c²≈931.5 MeV; B/A = binding per nucleon",
    "explain": "A bound nucleus has less mass than its separated constituents. The mass difference corresponds to binding energy, and binding energy per nucleon helps compare stability.",
    "assumptions": "User-selected mass defect and A are hypothetical; the background trend is qualitative, not measured isotope data.",
    "question": "Does the bound system gain or lose mass when binding energy is released?",
    "answer": "It loses mass relative to the separated constituents.",
    "scope": "Theory"
  },
  {
    "id": "reaction",
    "grade": 12,
    "ch": 13,
    "title": "Fission and fusion energy",
    "kind": "3D",
    "params": [
      {
        "key": "mode",
        "label": "0 fission · 1 D–T fusion",
        "min": 0,
        "max": 1,
        "step": 1,
        "value": 1,
        "unit": ""
      }
    ],
    "equation": "Q=(m_initial−m_final)c²",
    "explain": "Both fusion of suitable light nuclei and fission of suitable heavy nuclei can release energy by forming products that are more tightly bound per nucleon.",
    "assumptions": "Illustrative reactions: U-235+n→Ba-141+Kr-92+3n (approx. 200 MeV typical fission energy); D+T→He-4+n (17.6 MeV). Not a reactor or rate model.",
    "question": "How can both splitting and combining nuclei release energy?",
    "answer": "Both can move the products toward greater binding energy per nucleon.",
    "scope": "Theory"
  },
  {
    "id": "bands",
    "grade": 12,
    "ch": 14,
    "title": "Energy bands",
    "kind": "2D",
    "params": [
      {
        "key": "type",
        "label": "0 conductor · 1 semiconductor · 2 insulator",
        "min": 0,
        "max": 2,
        "step": 1,
        "value": 1,
        "unit": ""
      }
    ],
    "equation": "Conduction requires accessible electronic states",
    "explain": "Electrical conduction requires accessible electronic states and mobile carriers. Band gaps help distinguish conductors, semiconductors and insulators.",
    "assumptions": "Qualitative band diagram; chosen gaps illustrative, not a named material’s measured band structure.",
    "question": "Why do insulators conduct poorly at ordinary temperatures?",
    "answer": "Very few carriers have enough thermal energy to cross the large gap.",
    "scope": "Theory"
  },
  {
    "id": "doping",
    "grade": 12,
    "ch": 14,
    "title": "Intrinsic, n-type and p-type carriers",
    "kind": "2D",
    "params": [
      {
        "key": "type",
        "label": "0 intrinsic · 1 n-type · 2 p-type",
        "min": 0,
        "max": 2,
        "step": 1,
        "value": 1,
        "unit": ""
      },
      {
        "key": "dop",
        "label": "Dopant concentration",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 5,
        "unit": "relative"
      }
    ],
    "equation": "At equilibrium: np=n_i² (nondegenerate approximation)",
    "explain": "Donor atoms make electrons the majority carriers; acceptor atoms make holes the majority carriers. The bulk crystal remains approximately electrically neutral.",
    "assumptions": "Qualitative carrier/dopant counts; no realistic concentration or temperature calibration.",
    "question": "Is an n-type semiconductor negatively charged overall?",
    "answer": "No. Fixed ionised donors and mobile charges maintain overall neutrality in the bulk.",
    "scope": "Theory"
  },
  {
    "id": "junction",
    "grade": 12,
    "ch": 14,
    "title": "p–n junction and depletion region",
    "kind": "2D",
    "params": [
      {
        "key": "bias",
        "label": "Applied bias",
        "min": -0.8,
        "max": 0.6,
        "step": 0.1,
        "value": 0,
        "unit": "V"
      }
    ],
    "equation": "Forward bias reduces the barrier; reverse bias increases it",
    "explain": "Diffusion creates a depletion region and an internal electric field. Forward bias lowers the barrier; reverse bias raises it and widens the depletion region.",
    "assumptions": "Abrupt-junction qualitative model; built-in potential 0.7 V; depicted depletion width ∝√(V_bi−V); not a full semiconductor solver.",
    "question": "What does reverse bias do to the depletion width?",
    "answer": "It increases it.",
    "scope": "Theory"
  },
  {
    "id": "diode",
    "grade": 12,
    "ch": 14,
    "title": "Diode I–V characteristic",
    "kind": "2D",
    "params": [
      {
        "key": "V",
        "label": "Diode voltage",
        "min": -0.5,
        "max": 0.7,
        "step": 0.01,
        "value": 0.3,
        "unit": "V"
      },
      {
        "key": "T",
        "label": "Temperature",
        "min": 250,
        "max": 350,
        "step": 10,
        "value": 300,
        "unit": "K"
      }
    ],
    "equation": "I=I_s[exp(V/(nV_T))−1]; V_T=kT/q",
    "explain": "A diode has a nonlinear current-voltage relation. Forward current rises rapidly; a small reverse saturation current flows before breakdown, which this model does not include.",
    "assumptions": "Illustrative Shockley diode; I_s=10⁻⁹ A held fixed, n=2; no series resistance or breakdown. Temperature sweep is not a full material model.",
    "question": "Can a diode be treated as a constant resistor over its full voltage range?",
    "answer": "No. Its current is not proportional to voltage.",
    "scope": "Theory"
  },
  {
    "id": "rectifier",
    "grade": 12,
    "ch": 14,
    "title": "Diode rectification",
    "kind": "2D",
    "params": [
      {
        "key": "peak",
        "label": "AC peak voltage",
        "min": 2,
        "max": 20,
        "step": 1,
        "value": 10,
        "unit": "V"
      },
      {
        "key": "mode",
        "label": "0 half-wave · 1 full-wave bridge",
        "min": 0,
        "max": 1,
        "step": 1,
        "value": 0,
        "unit": ""
      },
      {
        "key": "drop",
        "label": "Each diode drop",
        "min": 0,
        "max": 1,
        "step": 0.1,
        "value": 0.7,
        "unit": "V"
      }
    ],
    "equation": "Half: V_out=max(0,V_in−V_D); bridge: max(0,|V_in|−2V_D)",
    "explain": "Diodes pass current preferentially in one direction. A rectifier converts an alternating input into a unidirectional but still varying output.",
    "assumptions": "Resistive load, no smoothing capacitor; constant diode-drop approximation; full bridge as teaching extension.",
    "question": "What is the ripple frequency of a full-wave output?",
    "answer": "Twice the input frequency.",
    "scope": "Theory"
  }
];
function P(key,label,min,max,step,value,unit=''){return {key,label,min,max,step,value,unit};}

'use strict';
const QUANTITIES={electric:{color:'#40d7ff',symbol:'E',name:'Electric field'},magnetic:{color:'#bb8cff',symbol:'B',name:'Magnetic field'},gravity:{color:'#66e49c',symbol:'g',name:'Gravitational field'},velocity:{color:'#ffad56',symbol:'v',name:'Velocity'},force:{color:'#ff6b87',symbol:'F',name:'Force'},acceleration:{color:'#ffe374',symbol:'a',name:'Acceleration'},current:{color:'#ffd15a',symbol:'I',name:'Conventional current'},flux:{color:'#f3a2df',symbol:'Φ',name:'Linked flux / area'},normal:{color:'#f1f5ff',symbol:'n',name:'Surface normal'},light:{color:'#ffdb82',symbol:'ray',name:'Light / energy transfer'},displacement:{color:'#88e2d0',symbol:'x',name:'Displacement'},energy:{color:'#ffcb7e',symbol:'U',name:'Energy'},secondary:{color:'#d4b3ff',symbol:'B₂',name:'Induced magnetic field'}};
const EXPERIMENTS=`
vernier|x|12.3|12.7|Read 12.3 mm|Read 12.7 mm
screw|x|2.37|2.42|Read 2.37 mm|Read 2.42 mm
uncertainty|da|0.1|0.5|Precise length|Less precise length
linear|a|-1|1|Negative acceleration|Positive acceleration
vectors|angle|0|90|Parallel vectors|Perpendicular vectors
projectile|angle|30|60|Launch at 30°|Launch at 60°
circular|v|2|4|Speed 2 m/s|Speed 4 m/s
incline|angle|10|40|Gentle slope|Steep slope
atwood|m2|3|6|Balanced masses|Unequal masses
banking|angle|0|30|Level road|Banked road
work|k|0|4|Constant force|Increasing force
energy|h|2|8|Low release|High release
collision|e|1|0|Elastic collision|Perfectly inelastic
collision2d|angle|20|60|Shallow scattering|Wide scattering
vertical|u|6|12|Insufficient speed|Complete loop
com|m2|2|6|Equal masses|Heavier right mass
torque|angle|0|90|Force along lever|Perpendicular force
inertia|shape|0|2|Ring|Solid sphere
angular|r|2|1|Arms extended|Arms contracted
rolling|shape|0|2|Rolling ring|Rolling sphere
orbit|e|0|0.3|Circular orbit|Elliptical orbit
gravity|r|0.5|2|Inside the sphere|Outside the sphere
escape|v|8|12|Bound energy|Escape energy
elastic|area|1|2|Thin wire|Thicker wire
hydrostatic|h|2|8|Shallow probe|Deep probe
hydraulic|a2|10|40|Small output area|Large output area
buoyancy|rho|600|1400|Floating block|Sinking block
bernoulli|ratio|1|0.5|Uniform pipe|Narrow outlet
viscosity|r|0.3|0.6|Small sphere|Double radius
capillary|angle|20|120|Capillary rise|Capillary depression
bubble|film|1|2|Liquid drop|Soap bubble
expansion|dt|0|150|Reference temperature|Heated solid
calorimetry|m1|0.5|1.5|Less hot water|More hot water
phase|power|250|750|Low heater power|High heater power
conduction|L|0.3|0.6|Short rod|Double length
radiation|T|2000|4000|Warm emitter|Hot emitter
convection|delta|0|60|No heating difference|Heated from below
thermo|mode|0|1|Isothermal path|Adiabatic path
cycle|Tc|200|350|Cold sink|Warmer sink
gas|T|200|400|Lower temperature|Double temperature
equipartition|f|3|5|Three degrees|Five degrees
spring|A|0.5|1|Small amplitude|Double amplitude
pendulum|L|0.5|2|Short pendulum|Four times the length
wave|lambda|1|2|Short wavelength|Double wavelength
longitudinal|A|0.05|0.2|Small displacement|Stronger compression
superposition|phase|0|180|In phase|Out of phase
standing|n|1|3|Fundamental mode|Third harmonic
pipes|closed|0|1|Both ends open|One end closed
beats|df|0|2|Same frequencies|Two beats per second
coulomb|q2|2|-2|Repulsion|Attraction
field|q2|2|-2|Like charges|Electric dipole
dipole|angle|0|90|Aligned dipole|Maximum torque
flux|angle|0|90|Field normal to plane|Field along plane
gauss|r|0.5|2|Inside shell|Outside shell
potential|q|2|-2|Positive source|Negative source
capacitor|K|1|4|Vacuum gap|Dielectric inserted
capnetwork|mode|0|1|Series capacitors|Parallel capacitors
drift|E|0.5|1|Weak electric field|Double electric field
resistance|A|1|2|Thin conductor|Double area
circuit|mode|0|1|Series resistors|Parallel resistors
cell|mode|0|1|Cells in series|Cells in parallel
kirchhoff|r2|6|12|Initial branch|Double branch resistance
wheatstone|S|10|5|Balanced bridge|Unbalanced bridge
magnetic|angle|0|90|Parallel entry|Perpendicular entry
wire|I|5|-5|Current along +z|Current along −z
loop|x|0|1|At the centre|Along the axis
solenoid|I|2|-2|Forward current|Reversed current
parallel|i2|5|-5|Same-direction currents|Opposite currents
looptorque|angle|0|90|Aligned loop normal|Maximum torque
galvanometer|mode|0|1|Ammeter conversion|Voltmeter conversion
bar|angle|0|90|Horizontal magnet|Vertical magnet
materials|type|0|2|Diamagnetic response|Ferromagnetic response
faraday|theta|0|90|Maximum projected area|Zero projected area
motional|v|1|3|Slow rod|Faster rod
self|L|0.5|1.5|Small inductance|Large inductance
mutual|d|0.65|1.8|Coils close together|Coils farther apart
ac|type|0|1|Resistive load|Inductive load
resonance|R|10|40|Sharp resonance|Damped resonance
generator|f|1|2|One turn per second|Two turns per second
transformer|n2|100|400|Step down|Step up
em|lambda|1|3|Short wavelength|Long wavelength
spectrum|logf|9|15|Microwave region|Ultraviolet region
lens|u|6|1|Object outside focus|Object inside focus
mirror|f|-2|2|Concave mirror|Convex mirror
refraction|angle|30|60|Refraction|Total internal reflection
prism|n|1.3|1.6|Lower refractive index|Higher refractive index
lensmaker|p2|0|-10|First lens alone|Opposite lens power
microscope|fo|1|0.5|Standard objective|Shorter objective focal length
telescope|fe|5|10|Short eyepiece|Long eyepiece
huygens|n2|1|1.5|Equal wave speeds|Slower second medium
interference|d|0.25|0.5|Narrow separation|Double separation
diffraction|a|0.1|0.2|Narrow slit|Double slit width
photoelectric|f|3|8|Below threshold|Above threshold
debroglie|V|100|400|Lower voltage|Four times the voltage
rutherford|b|10|80|Close encounter|Distant encounter
bohr|ni|3|4|n = 3 to n = 2|n = 4 to n = 2
nucleus|A|28|56|Smaller nucleus|More nucleons
binding|dm|0.2|0.5|Small mass defect|Larger mass defect
reaction|mode|0|1|Nuclear fission|Nuclear fusion
bands|type|0|2|Conductor|Insulator
doping|type|1|2|n-type material|p-type material
junction|bias|-0.5|0.5|Reverse bias|Forward bias
diode|V|-0.3|0.6|Reverse bias|Forward bias
rectifier|mode|0|1|Half-wave circuit|Full-wave circuit
`.trim().split('\n');
for(const row of EXPERIMENTS){let[id,key,a,b,la,lb]=row.split('|'),l=LESSONS.find(l=>l.id===id);l.experiment={key,a:Number(a),b:Number(b),labels:[la,lb]};}
const getLesson=id=>LESSONS.find(l=>l.id===id);
Object.assign(getLesson('mutual'),{params:[P('I','Primary peak current',.5,3,.5,1,'A'),P('f','Current frequency',0,2,.1,.5,'Hz'),P('d','Coil separation',.6,2.4,.05,.8,'m'),P('theta','Secondary tilt (normal to primary axis)',0,85,5,0,'°'),P('N1','Primary turns',20,100,10,50),P('N2','Secondary turns',20,100,10,50),P('closed','Secondary circuit',0,1,1,1)],equation:'Φ₂ = MI₁/N₂; ε₂ = −M dI₁/dt; I₂ ≈ ε₂/R (closed circuit)',assumptions:'Air-core circular coils with radii 0.45 m and 0.35 m. Mutual inductance is evaluated with a discretised Neumann integral (48 segments per coil); the primary field uses Biot–Savart segments. Secondary R = 5 Ω; low-frequency resistive approximation neglects secondary self-inductance and source back-reaction. Displayed field lines show the instantaneous primary field, not moving magnetic material. f = 0 means steady current.'});
Object.assign(getLesson('faraday'),{params:[P('B','Field amplitude',.1,1,.1,.5,'T'),P('f','Variation / rotation frequency',0,2,.1,.5,'Hz'),P('N','Coil turns',1,20,1,10),P('theta','Initial angle: field to normal',0,180,5,30,'°'),P('area','Loop area',.01,.12,.01,.05,'m²'),P('mode','Change mechanism',0,2,1,0)],equation:'Φ = BA cosθ = BA sinα; ε = −N dΦ/dt; α = 90° − θ',assumptions:'Uniform field and ideal loop. The reference field axis is +x; B is signed when the field reverses. θ is measured from that reference axis to the surface normal; α is the signed complementary angle to the plane (−90° to 90°). Field mode: B=B₀cosωt. Rotation mode: θ=θ₀+ωt. Area mode: A=A₀[1+0.4sinωt]. The rate controls time variation; changing a paused slider does not create a persistent emf.'});
getLesson('flux').params.push(P('convention','Angle convention',0,1,1,0));getLesson('flux').params.find(p=>p.key==='angle').label='Field-to-normal angle θ';getLesson('flux').assumptions='Uniform field and flat surface. The slider always sets the angle θ from the field to the normal. The complementary signed plane angle is α = 90° − θ. The formula selector changes the explanation, not the physical orientation.';
const CHOICES={faraday:{mode:['Change field','Rotate coil','Change area']},mutual:{closed:['Open: emf only','Closed: induced current']},flux:{convention:['Normal formula: cos θ','Plane formula: sin α']},inertia:{shape:['Ring','Uniform disc','Solid sphere']},rolling:{shape:['Ring','Uniform disc','Solid sphere']},bubble:{film:['Liquid drop','Soap bubble']},thermo:{mode:['Isothermal','Adiabatic']},pipes:{closed:['Open–open','Closed–open']},gauss:{shape:['Spherical shell','Long wire','Infinite sheet']},capacitor:{mode:['Battery connected','Isolated charge']},capnetwork:{mode:['Series','Parallel']},circuit:{mode:['Series','Parallel']},cell:{mode:['Series','Parallel']},magnetic:{sign:['Negative charge','Positive charge']},galvanometer:{mode:['Ammeter','Voltmeter']},materials:{type:['Diamagnetic','Paramagnetic','Ferromagnetic']},ac:{type:['Resistor','Inductor','Capacitor']},telescope:{reflect:['Refracting','Reflecting']},reaction:{mode:['Fission','D–T fusion']},bands:{type:['Conductor','Semiconductor','Insulator']},doping:{type:['Intrinsic','n-type','p-type']},rectifier:{mode:['Half-wave','Full-wave bridge']}};
for(const l of LESSONS){for(const p of l.params){if(CHOICES[l.id]?.[p.key])p.choices=CHOICES[l.id][p.key];}l.designNote='Compare two settings, inspect the visible cause and effect, then explain the result using the model assumptions.';}


getLesson('field').params.push(P('px','Probe x',-3,3,.1,0,'m'),P('py','Probe y',-2.5,2.5,.1,1.5,'m'));

// Standard configurations within the existing lessons.
QUANTITIES.potential={color:'#a9b5ff',symbol:'V',name:'Equipotential surface'};
const potentialLesson=getLesson('potential');
potentialLesson.params.unshift({...P('source','Source geometry',0,4,1,0),choices:['Point charge','Infinite line charge','Infinite sheet charge','Charged spherical shell','Uniformly charged solid sphere']});
potentialLesson.params.push(P('lambda','Line charge density',-5,5,.5,2,'nC/m'),P('sigma','Sheet charge density',-5,5,.5,2,'nC/m²'),P('radius','Sphere radius',.5,2,.1,1,'m'),P('reference','Zero-potential reference distance',.3,4,.1,1,'m'),{...P('shells','Surface display',0,1,1,1),choices:['Probe surface only','Nested surfaces']},P('azimuth','Probe angle around surface',0,360,5,25,'°'),P('elevation','Probe latitude / line height',-60,60,5,20,'°'));
potentialLesson.params.find(p=>p.key==='q').label='Total charge (point / sphere)';
potentialLesson.explain='Equipotentials are complete surfaces: spheres for a point charge, cylinders for an infinite line and parallel planes for an infinite sheet. Electric field is perpendicular to each surface. Move the probe around a surface: potential stays constant. Inside a charged shell the entire volume has the same potential and zero field.';
potentialLesson.equation='Point: V=kq/r. Line: ΔV=−λ ln(r/r₀)/(2πε₀). Sheet: ΔV=−σ(|x|−r₀)/(2ε₀). E=−∇V.';
potentialLesson.assumptions='Electrostatic ideal sources in vacuum. For point/spherical sources V(∞)=0. For infinite line and sheet V(∞) cannot be used: V=0 is set at the reference distance r₀. The sheet is nonconducting with equal field magnitude on each side. Sphere radius controls the shell/solid models only. Meshes are translucent mathematical equipotential surfaces, not material objects; their finite displayed extent does not make the line or sheet finite. With zero charge every point has the same potential and no unique nested surfaces exist.';
potentialLesson.question='Why can a charge move around an equipotential sphere, cylinder or plane without electrostatic work?';potentialLesson.answer='The potential difference is zero, so W=qΔV=0. Wherever E is nonzero, it is normal to the surface and has no tangential component.';
getLesson('projectile').params.find(p=>p.key==='angle').min=0;getLesson('projectile').params.find(p=>p.key==='angle').max=90;getLesson('projectile').params.push(P('height','Launch height',0,20,.5,0,'m'));
getLesson('projectile').assumptions='No air resistance; uniform selectable gravity; horizontal ground at y=0. Launch height allows horizontal projection. At zero height and zero launch angle, ground impact is immediate. Animation time is scaled to one flight.';
getLesson('collision').params.push(P('u2','Second body initial velocity',-6,6,.5,0,'m/s'));
getLesson('collision').equation='m₁u₁+m₂u₂=m₁v₁+m₂v₂; v₂−v₁=e(u₁−u₂)';getLesson('collision').assumptions='Isolated one-dimensional collision, body 1 initially to the left of body 2. They collide only if u₁>u₂. Travel is schematic; restitution controls kinetic energy loss.';
getLesson('self').params.push({...P('mode','RL switching',0,1,1,0),choices:['Switch on: current grows','Source removed: current decays']});getLesson('self').assumptions='Ideal inductor and resistor. Growth starts with zero current. Decay starts from I₀=V/R after the source is disconnected and a closed R–L discharge loop is formed. Animation covers five time constants.';getLesson('self').equation='Growth: I=(V/R)(1−e^(−tR/L)). Decay: I=(V/R)e^(−tR/L). εL=−L dI/dt.';
getLesson('loop').params.find(p=>p.key==='I').min=-10;getLesson('loop').params.find(p=>p.key==='x').min=-2;
// Every lesson exposes its supported standard cases without requiring students to guess sliders.
for(const l of LESSONS){let e=l.experiment;l.cases=[{name:'Default experiment',settings:{},note:l.assumptions},{name:e.labels[0],settings:{[e.key]:e.a},note:'Observe how '+l.params.find(p=>p.key===e.key).label.toLowerCase()+' changes the result.'},{name:e.labels[1],settings:{[e.key]:e.b},note:'Compare with the other setting while holding the remaining quantities fixed.'}];for(const p of l.params)if(p.choices&&p.key!=='shells'&&p.key!=='convention')p.choices.forEach((name,i)=>l.cases.push({name,settings:{[p.key]:p.min+i*p.step},note:'Use '+name.toLowerCase()+' and inspect the quantities, graph and assumptions.'}));}
function cases(id,rows){getLesson(id).cases.push(...rows.map(([name,settings,note])=>({name,settings,note})));}
cases('potential',[
 ['Point charge: concentric spheres',{source:0},'Complete spheres have equal V at all latitudes and longitudes. Rotate the camera to see depth.'],
 ['Line charge: coaxial cylinders',{source:1},'Move around or along a cylinder: radius and V stay constant. Reference V at a finite radius.'],
 ['Sheet: parallel planes',{source:2},'Planes on opposite sides at equal distance have the same V. E reverses across the sheet.'],
 ['Inside a charged shell',{source:3,r:.5,radius:1},'Every point inside the shell has the same V and zero E; the interior is an equipotential volume.'],
 ['Inside a uniformly charged sphere',{source:4,r:.5,radius:1},'V varies quadratically with r, while E grows linearly from the centre.'],
 ['Negative point charge',{source:0,q:-2},'The field points inward and V approaches zero from below.'],
 ['Zero source charge',{source:0,q:0},'All space is equipotential and E is zero; no preferred nested surfaces remain.']]);
cases('projectile',[
 ['Horizontal launch from height',{angle:0,height:10},'Horizontal velocity is initially nonzero; vertical motion starts from rest.'],
 ['Vertical launch',{angle:90,height:0},'Horizontal range is zero. The object rises and returns along the same line.'],
 ['Launch from an elevated platform',{angle:30,height:10},'Flight time includes the fall below the launch level; complementary angles no longer give equal range.'],
 ['Maximum ground-level range',{angle:45,height:0},'At fixed speed and equal launch/landing levels, the range is largest at 45°.']]);
cases('collision',[
 ['Equal masses: elastic exchange',{m1:2,m2:2,u:4,u2:0,e:1},'The velocities exchange.'],
 ['Head-on collision',{u:4,u2:-3,e:1},'Both bodies approach with opposite signs of initial velocity.'],
 ['Overtaking collision',{u:5,u2:2,e:.5},'The faster left body catches the right body.'],
 ['Perfectly inelastic: common velocity',{u:4,u2:-2,e:0},'After collision both bodies have the same velocity.'],
 ['No collision: separating velocities',{u:2,u2:4},'The right body is faster; the bodies do not approach. No collision formula is applied.']]);
cases('field',[
 ['Electric dipole',{q1:2,q2:-2},'Field lines run from the positive charge to the negative charge.'],
 ['Equal positive charges',{q1:2,q2:2,px:0,py:0},'The midpoint is a zero-field point even though the potential is not zero.'],
 ['Equal negative charges',{q1:-2,q2:-2},'Field directions reverse relative to two positive charges.'],
 ['Single isolated charge',{q1:2,q2:0},'The field is radial around the remaining nonzero charge.'],
 ['Unequal opposite charges',{q1:3,q2:-1},'The field has unequal source strengths; line samples are qualitative.']]);
cases('coulomb',[
 ['Like charges repel',{q1:2,q2:2},'Both forces point away from the other charge.'],
 ['Unlike charges attract',{q1:2,q2:-2},'Both forces point toward the other charge.'],
 ['One uncharged body',{q1:2,q2:0},'In this point-charge model the force is zero; induced polarisation is outside its scope.']]);
cases('refraction',[
 ['Normal incidence',{angle:0,n1:1,n2:1.5},'The ray is not bent.'],
 ['Rarer to denser',{angle:45,n1:1,n2:1.5},'The transmitted ray bends toward the normal.'],
 ['Denser to rarer',{angle:30,n1:1.5,n2:1},'The transmitted ray bends away from the normal.'],
 ['Total internal reflection',{angle:60,n1:1.5,n2:1},'Above the critical angle there is no transmitted ray.'],
 ['Matched refractive indices',{angle:45,n1:1.5,n2:1.5},'There is no change of ray direction.']]);
for(const id of ['lens','mirror']){let f=id==='lens'?3:-3;cases(id,[['Object beyond 2F',{f,u:9},'Observe the real image location, inversion and reduced size.'],['Object at 2F',{f,u:6},'The image has the same size.'],['Object between F and 2F',{f,u:4},'The real image is enlarged.'],['Object at F',{f,u:3},'Outgoing rays are parallel; the image is at infinity.'],['Object inside F',{f,u:2},'Dashed extensions locate the virtual image.'],[id==='lens'?'Diverging lens':'Convex mirror',{f:-f,u:6},'A real object produces a reduced virtual image.']]);}
cases('incline',[['Frictionless slope',{mu:0},'The only downslope force is the component of weight.'],['Static friction sufficient',{angle:15,mu:.6},'Static friction balances the downslope component.'],['Sliding threshold exceeded',{angle:45,mu:.2},'The model uses the specified coefficient for sliding friction.']]);
cases('vectors',[['Parallel addition',{angle:0},'Magnitudes add.'],['Perpendicular addition',{angle:90},'Use the Pythagorean resultant.'],['Opposite equal vectors',{a:3,b:3,angle:180},'The resultant is zero.']]);
cases('torque',[['Zero moment arm',{angle:0},'Force acts along the lever; torque is zero.'],['Maximum torque',{angle:90},'The force is perpendicular to the lever.']]);
cases('atwood',[['Equal masses',{m1:4,m2:4},'Acceleration is zero.'],['Left heavier',{m1:6,m2:2},'The left mass descends.'],['Right heavier',{m1:2,m2:6},'The right mass descends.']]);
cases('buoyancy',[['Floating',{rho:600,fluid:1000},'Only part of the body is submerged.'],['Neutral buoyancy',{rho:1000,fluid:1000},'Weight equals buoyancy when submerged.'],['Sinking',{rho:1400,fluid:1000},'The full-volume buoyant force is smaller than weight.']]);
cases('capillary',[['Wetting: rise',{angle:30},'The upward surface-tension component raises the liquid.'],['No rise',{angle:90},'The vertical component is zero.'],['Nonwetting: depression',{angle:120},'The level is depressed.']]);
cases('superposition',[['Constructive',{phase:0,a:1},'Equal in-phase waves add.'],['Destructive',{phase:180,a:1},'Equal opposite-phase waves cancel.'],['Unequal amplitudes',{phase:180,a:.5},'Cancellation is incomplete.']]);
cases('magnetic',[['Parallel velocity',{angle:0},'Magnetic force is zero and the path is straight.'],['Perpendicular velocity',{angle:90},'The path is circular.'],['Oblique velocity',{angle:45},'Parallel motion plus circular motion forms a helix.'],['Negative charge',{sign:-1,angle:45},'The direction of bending reverses.']]);
cases('flux',[['Maximum positive flux',{angle:0},'The field is parallel to the chosen normal.'],['Zero flux',{angle:90},'The field lies in the surface plane.'],['Negative flux',{angle:180},'The field opposes the chosen normal.']]);
cases('loop',[['At the centre',{x:0},'Axial field magnitude is maximum.'],['Current reversed',{I:-5},'The magnetic field reverses direction.'],['Current switched off',{I:0},'No magnetic field remains in this ideal air-core loop.'],['Opposite axial side',{x:-1},'Axial field magnitude is symmetric in x.']]);
cases('faraday',[['Steady field and orientation',{f:0},'Flux may be nonzero but emf is zero.'],['Field parallel to loop plane',{theta:90,mode:0},'Changing field produces no linked flux for this fixed orientation.'],['Rotating loop',{mode:1,theta:0},'Emf follows the rate of change of the orientation-dependent flux.'],['Changing loop area',{mode:2},'Area changes produce induction even when field and normal are fixed.']]);
cases('mutual',[['Steady primary current',{f:0},'Linked flux is steady and no secondary emf is induced.'],['Open secondary circuit',{closed:0},'Induced emf exists but secondary current is zero.'],['Large separation',{d:2.4},'Reduced coupling lowers mutual inductance.'],['Nearly perpendicular coils',{theta:85},'Tilting reduces the linked flux.']]);
cases('wheatstone',[['Balanced bridge',{P:5,Q:5,R:5,S:5},'The midpoint potentials are equal.'],['Unbalanced bridge',{P:5,Q:10,R:5,S:5},'The midpoint potential difference is nonzero.']]);
cases('photoelectric',[['Below threshold',{f:3,phi:3,intensity:1},'More intensity cannot overcome insufficient photon energy.'],['Above threshold',{f:10,phi:2,intensity:1},'Electrons are emitted with positive maximum kinetic energy.'],['No illumination',{intensity:0},'There are no incident photons or emitted electrons.']]);
cases('junction',[['Unbiased junction',{bias:0},'Built-in depletion field remains at equilibrium.'],['Forward bias',{bias:.5},'The depletion region narrows.'],['Reverse bias',{bias:-.5},'The depletion region widens.']]);

for(const p of getLesson('potential').params){const options={q:[0,3,4],lambda:[1],sigma:[2],radius:[3,4],reference:[1,2]};if(options[p.key])p.visibleFor=options[p.key];}
getLesson('gravity').params.push({...P('structure','Mass distribution',0,1,1,0),choices:['Uniform solid sphere','Thin spherical shell']});getLesson('gravity').params.find(p=>p.key==='r').min=0;getLesson('gravity').assumptions='Spherical symmetry with fixed Earth mass and radius. A uniform solid sphere has g proportional to r inside; a thin spherical shell has zero field inside and constant potential. At the shell surface the field readout uses the exterior limiting value. These are ideal distributions, not a model of Earth’s actual interior.';
cases('gravity',[['Uniform solid interior',{structure:0,r:.5},'Field grows linearly from the centre.'],['Hollow shell interior',{structure:1,r:.5},'The net gravitational field is zero, but the potential is negative.'],['At the centre',{structure:0,r:0},'Field is zero by symmetry.'],['Outside the sphere',{r:2},'Both distributions act as a point mass at the centre.']]);
let th=getLesson('thermo'),tm=th.params.find(p=>p.key==='mode');tm.max=3;tm.choices=['Isothermal','Adiabatic','Isobaric','Isochoric'];th.params.push(P('temperatureRatio','Isochoric temperature ratio',.5,3,.1,1.5));th.explain='Compare four ideal-gas processes: constant temperature, no heat transfer, constant pressure and constant volume. The first law uses heat into the gas and work done by the gas: Q=ΔU+W.';th.assumptions='One mole of ideal gas starts at 300 K and 0.020 m³. Constant heat capacities use the chosen γ. Volume ratio applies to the first three modes; only temperature ratio applies to the isochoric mode. The work is the signed area under the process path.';
cases('thermo',[['Isothermal expansion',{mode:0,ratio:2},'Temperature and internal energy remain constant.'],['Adiabatic expansion',{mode:1,ratio:2},'The gas cools while doing work with no heat input.'],['Isobaric expansion',{mode:2,ratio:2},'Pressure stays constant while volume and temperature increase.'],['Isochoric heating',{mode:3,temperatureRatio:2},'Volume is fixed, so W=0 and Q=ΔU.'],['Adiabatic compression',{mode:1,ratio:.5},'Work done on the gas increases temperature.']]);
getLesson('interference').params.push(P('ratio','Slit intensity ratio I₂/I₁',0,4,.1,1),P('phase','Initial phase difference',0,360,5,0,'°'),{...P('coherent','Coherence',0,1,1,1),choices:['Incoherent: time average','Coherent sources']});getLesson('interference').equation='I=I₁+I₂+2√(I₁I₂)cosδ; δ=2πdy/(λD)+φ; β=λD/d';getLesson('interference').assumptions='Far-field interference of two narrow slits without a diffraction envelope. Intensity is divided by (√I₁+√I₂)². I₁ is the unit reference; ratio zero blocks slit 2. Incoherent mode averages out the cross term. Apparatus distances and wavefronts are schematic.';
cases('interference',[['Equal coherent slits',{ratio:1,phase:0,coherent:1},'Dark fringes reach zero intensity.'],['Unequal coherent slits',{ratio:.25,coherent:1},'Dark fringes no longer reach zero.'],['Phase reversal',{ratio:1,phase:180,coherent:1},'The central bright fringe becomes dark.'],['One slit blocked',{ratio:0},'There is no two-source interference modulation in this ideal narrow-slit model.'],['Incoherent sources',{coherent:0},'Time-averaged intensities add without stable fringes.']]);
getLesson('potential').params.push({...P('axial','Axial / in-plane offset',-2,2,.1,.5,'m'),visibleFor:[1,2]},{...P('transverse','Second in-plane offset',-2,2,.1,.5,'m'),visibleFor:[2]},{...P('side','Side of the sheet',-1,1,2,1),choices:['Negative x side','Positive x side'],visibleFor:[2]});
getLesson('potential').params.find(p=>p.key==='elevation').label='Probe latitude';getLesson('potential').params.find(p=>p.key==='elevation').visibleFor=[0,3,4];getLesson('potential').params.find(p=>p.key==='azimuth').visibleFor=[0,1,3,4];
getLesson('thermo').equation='Q=ΔU+W; ΔU=nCᵥΔT; W=∫P dV. Isochoric: W=0. Adiabatic: Q=0.';
getLesson('gravity').explain='Spherical symmetry makes the exterior field depend only on total mass. Inside a uniform solid sphere the field is proportional to radius. Inside a thin shell the net field vanishes everywhere, while the gravitational potential is a constant negative value.';

getLesson('capnetwork').params.push(P('voltage','Supply voltage',0,12,.5,12,'V'));
getLesson('capnetwork').assumptions+=' Voltage sweeps compare electrostatic equilibrium states; they do not simulate a charging transient or imply a charging time constant.';
for(const id of ['interference','diffraction'])getLesson(id).params.push(P('screenRange','Screen half-range',2,30,1,10,'mm'));
getLesson('interference').params.push(P('slitWidth','Width of each slit',.015,.08,.005,.04,'mm'));
getLesson('interference').assumptions='Fraunhofer approximation. Two identical finite-width slits produce interference inside a single-slit sinc² envelope. Slit separation and slit width use the same magnified transverse scale; longitudinal distance has its own scale. The screen ruler stays fixed unless Screen half-range is changed. Wave motion is greatly slowed; wavefronts illustrate emission and propagation, while screen intensity is calculated from optical path phase. Incoherent mode removes the interference term but retains the diffraction envelope.';
getLesson('diffraction').assumptions='Fraunhofer single-slit diffraction, I/I₀ = sinc²(πay/λD). The screen ruler is fixed unless Screen half-range is changed. Apparatus and screen use separate labelled magnifications; travelling wavefronts are a slowed illustration.';
getLesson('interference').equation='I ∝ sinc²(πay/λD)[I₁+I₂+2√(I₁I₂)cos(2πdy/λD+φ)]; β=λD/d. Incoherent average: omit the cosine term.';
getLesson('interference').cases.find(c=>c.name==='One slit blocked').note='Only single-slit diffraction remains; there is no two-source interference term.';

if(typeof module!=="undefined")module.exports={CHAPTERS,LESSONS,QUANTITIES};