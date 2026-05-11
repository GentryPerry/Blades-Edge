import React from 'react';
import { Swords, Shield, Dices, Moon, User, Users, Skull, Clock, Zap, Globe, BookOpen, Package } from "lucide-react";

export const ALL_SOURCES = ["BitD Core", "Deep Cuts", "B68"];
export const SOURCE_LABELS = { "BitD Core":"BitD Core", "Deep Cuts":"Deep Cuts", "B68":"B68" };
export const srcLabel = s => SOURCE_LABELS[s] || s;

export function accentColor(src = "") {
  const s = src.toLowerCase();
  if (s.includes("deep cut")) return { bar:"#991b1b", title:"var(--rule-title-dc)", badge:"rgba(127,29,29,0.7)", badgeTxt:"#fca5a5", dot:"#ef4444" };
  if (s.includes("b68") || s.includes("68")) return { bar:"#1d4ed8", title:"var(--rule-title-b68)", badge:"rgba(30,58,138,0.7)", badgeTxt:"#93c5fd", dot:"#3b82f6" };
  return                             { bar:"#404040", title:"var(--rule-title-bitd)", badge:"rgba(38,38,38,0.9)",  badgeTxt:"#a3a3a3", dot:"#737373" };
}

export const NAV = [
  { role:"player", label:"Player", category:"Player", tabs:[
    { id:"Actions",           label:"Actions",      icon:<Swords size={12}/> },
    { id:"Rolls",             label:"Rolls",        icon:<Dices size={12}/> },
    { id:"Pos & Effect", label:"Pos & Effect", icon:<Shield size={12}/> },
    { id:"Downtime",          label:"Downtime",     icon:<Moon size={12}/> },
    { id:"Playbooks",         label:"Playbooks",    icon:<BookOpen size={12}/> },
    { id:"Standard Items",    label:"Items",        icon:<Package size={12}/> },
  ]},
  { role:"roster",        label:"Roster",        category:"Roster",        tabs:[
    { id:"Characters",       label:"Characters",       icon:<User size={12}/> }
  ]},
  { role:"crew",        label:"Crew",        category:"Crew",        tabs:[{ id:"Cohorts",       label:"Cohorts",       icon:<Users size={12}/> }]},
  { role:"storyteller", label:"Storyteller", category:"Storyteller", tabs:[
    { id:"Entanglements", label:"Entanglements", icon:<Skull size={12}/> },
    { id:"Clocks",        label:"Clocks",        icon:<Clock size={12}/> },
    { id:"Generators ✨",   label:"Generators",    icon:<Zap size={12}/> }
  ]},
  { role:"world",       label:"World",       category:"World",       tabs:[{ id:"Factions",      label:"Factions",      icon:<Globe size={12}/> }]},
];

export const RADICAL_EXPLOSIVES = [
  "Grenade", "Gravity anomaly bomb", "Proximity mine", "Placed explosive", 
  "Resonance nullifier", "Euphoric mist", "Stun grenade", "Resonance amplifier", 
  "Coolant gel grenade", "Smoke bomb", "Anti-sparktech pulse grenade", 
  "Psychedelic mist", "Fire bomb"
];

export const PLAYBOOKS = {
  "BitD Core": {
    "Cutter": { dots: { skirmish: 2, command: 1 }, abilities: ["Battleborn", "Bodyguard", "Ghost Fighter", "Leader", "Mule", "Not to be Trifled With", "Savage", "Vigorous", "Versatile"] },
    "Hound": { dots: { hunt: 2, survey: 1 }, abilities: ["Sharpshooter", "Focused", "Ghost Hunter", "Scout", "Survivor", "Tough As Nails", "Vengeful", "Versatile"] },
    "Leech": { dots: { tinker: 2, wreck: 1 }, abilities: ["Alchemist", "Artificer", "Physician", "Saboteur", "Venomous", "Ghost Ward", "Versatile"] },
    "Lurk": { dots: { prowl: 2, finesse: 1 }, abilities: ["Infiltrator", "Ambush", "Assassin", "Daredevil", "Expertise", "Ghost Veil", "Reflexes", "Versatile"] },
    "Slide": { dots: { consort: 2, sway: 1 }, abilities: ["Rook's Gambit", "Cloak & Dagger", "Ghost Voice", "Like Looking in a Mirror", "A Little Something on the Side", "Mesmerism", "Subterfuge", "Trust in Me", "Versatile"] },
    "Spider": { dots: { study: 2, consort: 1 }, abilities: ["Foresight", "Calculating", "Connected", "Functioning Vice", "Ghost Contract", "Mastermind", "Weaving the Web", "Versatile"] },
    "Whisper": { dots: { attune: 2, study: 1 }, abilities: ["Compel", "Ghost Mind", "Iron Will", "Occultist", "Ritual", "Strange Methods", "Tempest", "Warded", "Versatile"] }
  },
  "B68": {
    "Hound": { dots: { hunt: 2, survey: 1 }, abilities: ["Hound's Instincts", "Learn the Hard Way", "Just a Scratch", "Fixer", "In Too Deep", "Echo Pet", "Dogged Persistence", "Versatile"] },
    "Hull": { dots: { skirmish: 2, tinker: 1 }, abilities: ["Automaton", "Powerhouse", "Retractable Arsenal", "Energy Beam", "Interface", "Frame Upgrade", "Versatile"] },
    "Intellectual": { dots: { study: 2, tinker: 1 }, abilities: ["Unalloyed Genius", "Mentalist", "High-Functioning Insomniac", "Try Not to Break It This Time", "Researcher", "Anatomist", "Encyclopedic Knowledge", "Advanced Sparkmind", "Versatile"] },
    "Operative": { dots: { prowl: 2, finesse: 1 }, abilities: ["Clean", "Double Agent", "Dead Drop", "Echo Walker", "Wetwork", "Cipher", "Sleeper Agents", "Control", "Versatile"] },
    "Paranormalist": { dots: { attune: 2, study: 1 }, abilities: ["Third Eye Opened", "Precognition", "Psychokinesis", "Extrasensory Perception", "Forbidden Science", "Echo Projection", "Medium", "Parapsychology", "Versatile"] },
    "Radical": { dots: { command: 2, consort: 1 }, abilities: ["True Believer", "Direct Action", "Echo Chamber", "Fellow Travelers", "Polemicist", "Praxis", "Pamphleteer", "Total Dedication", "Versatile"] },
    "Swinger": { dots: { consort: 2, sway: 1 }, abilities: ["Here Goes Nothing", "Yeah, Baby", "Groove Machine", "Improviser", "Always Hustling", "Party Animal", "Echo Twin", "Smooth", "Versatile"] },
    "Veteran": { dots: { skirmish: 2, command: 1 }, abilities: ["Military Discipline", "Got Your Back", "Echo Fighter", "Leadership", "Walking Arsenal", "War Machine", "Get Back In There", "Creative Community", "Versatile"] },
    "Ghost/Echo": { dots: {}, abilities: ["Resonance Echo", "Dissipate", "Manifest", "Poltergeist", "Possess", "Versatile"] },
    "Vampire": { dots: {}, abilities: ["Terrible Power", "Telepathy", "Resonance Void", "Dark Majesty", "Sinister Guile", "Feral Whispers", "Versatile"] },
    "Time Traveler": { dots: {}, abilities: ["Future Shock", "Advanced Combat Reflexes", "Psionics", "Pocket Dimension", "Multi-Dimensional", "Quantum Displacement", "Save and Reload", "Versatile"] }
  }
};

export const XP_TRIGGERS = {
  "BitD Core": {
    "Cutter": "violence or coercion",
    "Hound": "tracking or violence",
    "Leech": "technical skill or mayhem",
    "Lurk": "stealth or evasion",
    "Slide": "deception or influence",
    "Spider": "calculation or conspiracy",
    "Whisper": "knowledge or arcane power"
  },
  "B68": {
    "Hound": "talking or determination",
    "Hull": "cold simplicity or following orders",
    "Intellectual": "technical skill or cleverness",
    "Operative": "stealth or deception",
    "Paranormalist": "knowledge or paranormal power",
    "Radical": "persuasion or mayhem",
    "Swinger": "charm or quick thinking",
    "Veteran": "violence or discipline",
    "Ghost/Echo": "exact vengeance or express outrage",
    "Vampire": "display dominance or slay without mercy",
    "Time Traveler": "fearless conviction or lateral thinking"
  }
};

export const ITEMS_LISTS = {
  "BitD Core": [
    { id: "core-blade", name: "A Blade or Two", boxes: 1 },
    { id: "core-knives", name: "Throwing Knives", boxes: 1 },
    { id: "core-pistol", name: "A Pistol", boxes: 1 },
    { id: "core-large", name: "A Large Weapon", boxes: 2 },
    { id: "core-unusual", name: "An Unusual Weapon", boxes: 1 },
    { id: "core-armor", name: "Armor", boxes: 2 },
    { id: "core-heavy", name: "+Heavy Armor", boxes: 3 },
    { id: "core-burglar", name: "Burglary Gear", boxes: 1 },
    { id: "core-climbing", name: "Climbing Gear", boxes: 2 },
    { id: "core-arcane", name: "Arcane Implements", boxes: 1 },
    { id: "core-docs", name: "Documents", boxes: 1 },
    { id: "core-subterfuge", name: "Subterfuge Supplies", boxes: 1 },
    { id: "core-demo", name: "Demolition Tools", boxes: 2 },
    { id: "core-tinker", name: "Tinkering Tools", boxes: 1 },
    { id: "core-lantern", name: "Lantern", boxes: 1 }
  ],
  "B68": [
    { id: "b68-blade", name: "A Blade or Two", boxes: 1 },
    { id: "b68-silenced", name: "Silenced Shooter", boxes: 1 },
    { id: "b68-handcannon", name: "Handcannon [ ] x2", boxes: 1 },
    { id: "b68-electro", name: "Electro-Blade", boxes: 2 },
    { id: "b68-pump", name: "Pump-Action Scattergun", boxes: 2 },
    { id: "b68-armor", name: "Armor", boxes: 3 },
    { id: "b68-burglar", name: "Burglary Gear", boxes: 1 },
    { id: "b68-climbing", name: "Climbing Gear", boxes: 2 },
    { id: "b68-paranormal", name: "Paranormal Implements", boxes: 1 },
    { id: "b68-docs", name: "Documents", boxes: 1 },
    { id: "b68-subterfuge", name: "Subterfuge Supplies", boxes: 1 },
    { id: "b68-demo", name: "Demolition Tools", boxes: 2 },
    { id: "b68-tinker", name: "Tinkering Tools", boxes: 1 },
    { id: "b68-arc", name: "Arclighter", boxes: 1 }
  ]
};

export const PLAYBOOK_ITEMS = {
  "Hound": [
    { name: "Fine snub-nosed handcannon", boxes: 1 },
    { name: "A loyal, clever pet", boxes: 1 },
    { name: "Binoculars", boxes: 1 },
    { name: "Hipflask of the good stuff", boxes: 1 },
    { name: "Pocketful of focus pills", boxes: 1 },
    { name: "RF radio handset", boxes: 1 }
  ],
  "Hull": [
    { name: "Advanced Visual Sensors", boxes: 1 },
    { name: "Lifelike Appearance", boxes: 1 },
    { name: "Hidden Compartment", boxes: 1 },
    { name: "Smokescreen Emitter", boxes: 1 },
    { name: "Surveillance Hardware", boxes: 1 },
    { name: "Jet Propulsion", boxes: 1 }
  ],
  "Intellectual": [
    { name: "Fine tinkering tools", boxes: 1 },
    { name: "Experimental laser cannon", boxes: 2 },
    { name: "Gadgets", boxes: 1 },
    { name: "Pocketful of focus pills", boxes: 1 },
    { name: "RF radio handset", boxes: 1 },
    { name: "Sparkmind assistant", boxes: 1 }
  ],
  "Operative": [
    { name: "Truth serum syringe", boxes: 1 },
    { name: "Fine sniper rifle", boxes: 2 },
    { name: "Tiny tracking device", boxes: 1 },
    { name: "Fine silenced shooter", boxes: 1 },
    { name: "Fine disguise", boxes: 1 },
    { name: "RF radio handset", boxes: 1 }
  ],
  "Paranormalist": [
    { name: "Fine resonance gauge", boxes: 1 },
    { name: "Resonance accelerator pack", boxes: 2 },
    { name: "Fine echo containment unit", boxes: 1 },
    { name: "Psychic amplification device", boxes: 1 },
    { name: "Loyal resonance entity", boxes: 1 },
    { name: "RF radio handset", boxes: 1 }
  ],
  "Radical": [
    { name: "Provocative manifesto", boxes: 1 },
    { name: "Nondescript change of clothes", boxes: 1 },
    { name: "Bandolier (3 uses)", boxes: 1 },
    { name: "Pocketful of go-go pills", boxes: 1 },
    { name: "RF radio handset", boxes: 1 }
  ],
  "Swinger": [
    { name: "Fine clothes & jewelry", boxes: 1 },
    { name: "Fine two-seat autopod", boxes: 1 },
    { name: "An invitation to the party", boxes: 1 },
    { name: "Fine concealed shooter", boxes: 1 },
    { name: "Pocketful of sleeping pills", boxes: 1 },
    { name: "RF radio handset", boxes: 1 }
  ],
  "Veteran": [
    { name: "Submachine Coilgun (SMC)", boxes: 1 },
    { name: "Heavy Coilgun (HAC50)", boxes: 2 },
    { name: "A few grenades", boxes: 1 },
    { name: "Heat blade", boxes: 1 },
    { name: "Pocketful of go-go pills", boxes: 1 },
    { name: "RF radio handset", boxes: 1 }
  ],
  "Ghost/Echo": [
    { name: "Fine shadow cloak", boxes: 1 },
    { name: "Fine blade (Jira-forged)", boxes: 1 },
    { name: "Fine antiquated pistol", boxes: 1 },
    { name: "Electroplasmic ammo", boxes: 1 },
    { name: "Demonbane charm", boxes: 1 },
    { name: "Mysterious ghost key", boxes: 1 }
  ]
};