import { crews as crewApi, getToken } from './api/client.js';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Shield, FileText, ChevronRight, ChevronDown, ChevronLeft, Target,
  CheckCircle, Lock, Edit3, X, Zap, Crown, Users, TrendingUp,
  Settings, ArrowLeft, PlusCircle, Trash2, DollarSign, Minus, Plus,
  Dices, AlertTriangle, Star, Flame, Car, Eye, BookOpen,
  Share2, Copy, UserPlus, UserCheck, UserX, Clock
} from 'lucide-react';

// ─── CREW ICON MAP ────────────────────────────────────────────────────────────
const CREW_ICONS = {
  swords:  (s=18) => <Dices size={s} />,
  package: (s=18) => <Shield size={s} />,
  zap:     (s=18) => <Zap size={s} />,
  car:     (s=18) => <Car size={s} />,
  eye:     (s=18) => <Eye size={s} />,
  star:    (s=18) => <Star size={s} />,
};
const CrewIcon = ({ id, size = 18, className = '', color = '#a3a3a3' }) => {
  const cls = className || '';
  const icons = {
    swords:  <Dices size={size} className={cls} style={{ color }} />,
    package: <Shield size={size} className={cls} style={{ color }} />,
    zap:     <Zap size={size} className={cls} style={{ color }} />,
    car:     <Car size={size} className={cls} style={{ color }} />,
    eye:     <Eye size={size} className={cls} style={{ color }} />,
    star:    <Star size={size} className={cls} style={{ color }} />,
  };
  return icons[id] || <Shield size={size} className={cls} style={{ color }} />;
};


// ─── CREW TEMPLATE DATA ──────────────────────────────────────────────────────

const CREW_TEMPLATES = {
  HitSquad: {
    name: 'Hit Squad',
    tagline: 'Professional killers for hire',
    description: 'Assassinations, disappearances, murders, and ransom operations.',
    xpTrigger: 'Execute a successful accident, disappearance, murder, or ransom operation.',
    color: '#dc2626',
    icon: 'swords',
    startingUpgrades: ['Training: Prowess', 'Cohort: Gang (Muscle)'],
    specificUpgrades: [
      { name: 'Assassin Rigging', desc: 'You get 2 free load worth of weapon or gear items.' },
      { name: 'Elite Infiltrators', desc: 'All Infiltrator cohorts get +1d to Quality rolls for Infiltrator-related actions.' },
      { name: 'Elite Muscle', desc: 'All Muscle cohorts get +1d to Quality rolls for Muscle-related actions.' },
      { name: 'Deep', desc: 'Each PC gets +1 key/deadlock box. Costs three upgrades to unlock.' },
    ],
    abilities: [
      { name: 'Take the Shot', desc: 'When any PC takes the decisive action to eliminate a key target, they get +1d. Both "decisive action" and "key target" must apply.' },
      { name: 'Under the Radar', desc: 'When you kill someone during a score, take 2 Stress so it doesn\'t count toward Heat afterwards. How does your crew avoid the Death Radar?' },
      { name: 'Chameleons', desc: 'Take +1d to the engagement roll for stealth or deception approaches. When you subdue someone and don their outfit, the disguise has increased effect.' },
      { name: 'Cold Storage', desc: 'Every crew member can always find a convenient place to hide a body nearby. Take 1 Stress to hide the body in the resonance field instead.' },
      { name: 'Benefactor', desc: 'Crew immediately receives 4 stacks. Whenever you advance your Tier, it costs half the stacks it normally would.' },
      { name: 'Loopers', desc: 'Take 4 Stress after any action roll to roll it again and take the best result. The second roll uses the exact same number of dice.' },
      { name: 'Professionals', desc: 'When you keep an operation quiet or make it look like an accident, get half the Rep value (round up) instead of zero. When you end downtime with zero Heat, take +1 Rep.' },
    ],
    claims: [
      { id: 'lair',          x: 2, y: 2, label: 'Lair',             benefit: 'Your base of operations.',           defaultState: 'owned', special: false },
      { id: 'informants',    x: 2, y: 1, label: 'Informants',       benefit: '+1d to gather info for scores.',     connections: ['lair'] },
      { id: 'protection',    x: 3, y: 2, label: 'Protection Racket',benefit: '+2 Stacks per payoff.',              connections: ['lair'] },
      { id: 'dive_bar',      x: 1, y: 2, label: 'Dive Bar',         benefit: '+1d to Consort.',                   connections: ['lair'] },
      { id: 'fixer',         x: 2, y: 3, label: 'Fixer',            benefit: '+1d to acquire assets.',            connections: ['lair'] },
      { id: 'city_records',  x: 4, y: 2, label: 'City Records',     benefit: '+1d to engagement (stealth).',      connections: ['protection'] },
      { id: 'weapons_cache', x: 2, y: 0, label: 'Weapons Cache',    benefit: '+1d to loadout quality.',           connections: ['informants'] },
      { id: 'safehouse',     x: 1, y: 3, label: 'Safehouse',        benefit: 'Reduce heat by 1 after score.',     connections: ['dive_bar', 'fixer'] },
      { id: 'leg_target',    x: 0, y: 2, label: 'Legendary Target', benefit: '★ One-off: Tier 5 score. 15 Rep, 10 stacks payout.', connections: ['dive_bar'], special: true },
      { id: 'cover_op',      x: 3, y: 3, label: 'Cover Operation',  benefit: '-2 Heat per score.',                connections: ['fixer'] },
    ],
  },

  Dealers: {
    name: 'Dealers',
    tagline: 'Pushers of contraband',
    description: 'Bulk acquisition, bulk sale, social intrigue, and shows of force.',
    xpTrigger: 'Execute a successful bulk acquisition, bulk sale, social intrigue, or show of force operation.',
    color: '#16a34a',
    icon: 'package',
    startingUpgrades: ['Lair: Secure', 'Cohort: Gang (Hustlers)'],
    specificUpgrades: [
      { name: 'Dealer Rigging', desc: 'One carried item is concealed and has no load (does not work for armor).' },
      { name: 'Elite Hustlers', desc: 'All Hustler cohorts get +1d to Quality rolls for Hustler-related actions.' },
      { name: 'Elite Muscle', desc: 'All Muscle cohorts get +1d to Quality rolls for Muscle-related actions.' },
      { name: 'Intriguing', desc: 'Each PC gets +1 key/deadlock box. Costs three upgrades to unlock.' },
    ],
    abilities: [
      { name: 'First Rate', desc: 'Your merchandise is exquisite. Gain potency when you Sway or Consort with those hooked on your product. The GM always tells you who among a crew or faction is hooked (never "none").' },
      { name: 'On Retainer', desc: 'Expert lawyer, Quality = crew Tier + 2. When you Reduce Heat, your lawyer can roll their Quality instead. When you take the rap, Wanted Level counts as one lower.' },
      { name: 'Benefactor', desc: 'Crew immediately receives 4 stacks. Whenever you advance your Tier, it costs half the stacks it normally would.' },
      { name: 'First One\'s Free', desc: 'Give away product to build Rep during downtime. 1 Rep costs 1 unit.' },
      { name: 'Field Testing', desc: 'Prepare a special cut for a score (healing, exhilarating, calming, or enlightening). Each costs 1 unit, 1 load, one use.' },
      { name: 'Payment in Kind', desc: 'Use product units to purchase crew upgrades. 1 upgrade costs 5 units.' },
    ],
    claims: [
      { id: 'lair',           x: 2, y: 2, label: 'Lair',            benefit: 'Your base of operations.',        defaultState: 'owned' },
      { id: 'local_supplier', x: 2, y: 3, label: 'Local Supplier',  benefit: 'Take 1 Heat: gain 1 unit per personal business.',  connections: ['lair'] },
      { id: 'turf_1',         x: 1, y: 2, label: 'Turf',            benefit: '+1 Stack when moving units.',     connections: ['lair'] },
      { id: 'turf_2',         x: 3, y: 2, label: 'Turf',            benefit: '+1 Stack when moving units.',     connections: ['lair'] },
      { id: 'smuggler',       x: 2, y: 4, label: 'Smuggler',        benefit: 'Take 1 Heat: gain 2 units per personal business.',  connections: ['local_supplier'] },
      { id: 'vip_clients',    x: 1, y: 1, label: 'VIP Clients',     benefit: '+2 Stacks on sales.',             connections: ['turf_1'] },
      { id: 'money_launder',  x: 3, y: 1, label: 'Money Launderer', benefit: 'Take -3 Heat from dealing activities per personal business.', connections: ['turf_2'] },
      { id: 'branding',       x: 0, y: 2, label: 'Branding',        benefit: '+1d to engagement (social plans). +2 stacks payout for bulk operations.', connections: ['turf_1'] },
      { id: 'monopoly',       x: 2, y: 0, label: 'Monopoly',        benefit: '★ One-off vs Tier 5: all Turf moves 2 units for same Heat.', connections: ['money_launder'], special: true },
    ],
  },

  Militants: {
    name: 'Militants',
    tagline: 'Activists pushing for revolutionary change',
    description: 'Assassination, demonstration, sabotage, and battle operations.',
    xpTrigger: 'Execute a successful assassination, demonstration, sabotage, or battle operation.',
    color: '#d97706',
    icon: 'zap',
    startingUpgrades: ['Training: Resolve', 'Cohort: Gang (Muscle)'],
    specificUpgrades: [
      { name: 'Militant Rigging', desc: '2 free load worth of weapon or armor items. E.g. wear armor for 1 load instead of 3.' },
      { name: 'Elite Runners', desc: 'All Runner cohorts get +1d to Quality rolls for Runner-related actions.' },
      { name: 'Elite Muscle', desc: 'All Muscle cohorts get +1d to Quality rolls for Muscle-related actions.' },
      { name: 'Complicated', desc: 'Each PC gets +1 key/deadlock box. Costs three upgrades to unlock.' },
    ],
    abilities: [
      { name: 'Sympathizers', desc: 'Common citizenry of your home ground and any turf are sympathetic allies (status +3). They will shelter you, redirect enemies, and give other aid.' },
      { name: 'Mutual Aid', desc: 'Lend support to one allied faction; their Tier counts as one higher. Get one free downtime activity on their long-term project. Switch support once per downtime.' },
      { name: 'Guerrillas', desc: 'When target is two or more Tier higher, take no penalty to engagement roll and gain +2 Rep after the score (success or not).' },
      { name: 'On the Side of the Oppressed', desc: 'Loudly oppose the Bluecoats. Count each Wanted Level as if it were turf.' },
      { name: 'Absolute Commitment', desc: 'Solemn vows of service to the cause. All PCs get +1d to resistance rolls.' },
      { name: 'Benefactor', desc: 'Crew immediately receives 4 stacks. Whenever you advance your Tier, it costs half the stacks it normally would.' },
      { name: 'Revolutionaries', desc: 'When you\'re at war (-3 faction status), your crew does not suffer -1 hold and PCs still get two downtime activities instead of one.' },
    ],
    claims: [
      { id: 'lair',          x: 2, y: 2, label: 'Base',             benefit: 'Your base of operations.',         defaultState: 'owned' },
      { id: 'informants',    x: 0, y: 3, label: 'Informants',       benefit: '+1d to gather information for a score.', connections: ['lair'] },
      { id: 'donations',     x: 1, y: 3, label: 'Donations',        benefit: '+2 stacks payout for sabotage or assassination scores.', connections: ['lair'] },
      { id: 'dispensary',    x: 2, y: 3, label: 'Dispensary',       benefit: '+1d to healing treatment rolls.',  connections: ['lair'] },
      { id: 'social_clubs',  x: 3, y: 3, label: 'Social Clubs',     benefit: '+1d to Consort and Sway on-site.', connections: ['lair'] },
      { id: 'turf_1',        x: 1, y: 2, label: 'Turf',             benefit: 'Reduces Rep cost to advance Tier.', connections: ['lair'] },
      { id: 'turf_2',        x: 3, y: 2, label: 'Turf',             benefit: 'Reduces Rep cost to advance Tier.', connections: ['lair'] },
      { id: 'popular_supp',  x: 1, y: 1, label: 'Popular Support',  benefit: '+1d to engagement (stealth). Citizens will cover for you.', connections: ['turf_1'] },
      { id: 'hostel',        x: 3, y: 1, label: 'Hostel',           benefit: 'Muscle cohorts get +1 scale.',     connections: ['turf_2'] },
      { id: 'meeting_hall',  x: 2, y: 0, label: 'Meeting Hall',     benefit: '+1d to Consort and Sway on-site.', connections: ['popular_supp', 'hostel'] },
      { id: 'catalyst',      x: 0, y: 1, label: 'Catalyst Action',  benefit: '★ One-off vs Tier 4: creates new Tier 2 faction, +2 status with crew.', connections: ['popular_supp'], special: true },
      { id: 'crit_strike',   x: 4, y: 1, label: 'Critical Strike',  benefit: '★ One-off vs Tier 5: target faction drops two Tiers immediately.', connections: ['hostel'], special: true },
    ],
  },

  Racers: {
    name: 'Racers',
    tagline: 'Thrill-seekers, smugglers, daredevils, and family',
    description: 'Smuggling, hijacking, racing, and hot pursuit operations.',
    xpTrigger: 'Execute a successful smuggling, hijacking, racing, or hot pursuit operation.',
    color: '#7c3aed',
    icon: 'car',
    startingUpgrades: ['Vehicles: Personal Autopods', 'Lair: Workshop'],
    specificUpgrades: [
      { name: 'Racer Rigging', desc: 'Two of your carried items are perfectly concealed, even against a pat down.' },
      { name: 'Airship', desc: 'Add mobility to your base. Move it to a new location as a downtime activity — thwarts potential raids.' },
      { name: 'Elite Runners', desc: 'All Runner cohorts get +1d to Quality rolls for Runner-related actions.' },
      { name: 'Heavy Vehicles', desc: 'A semi-truck, bulldozer, bus, or armored car. A second upgrade adds another heavy vehicle.' },
      { name: 'Complicated', desc: 'Each PC gets +1 key/deadlock box. Costs three upgrades to unlock.' },
    ],
    abilities: [
      { name: 'Stunt Riders', desc: 'The first time a signature stunt is performed during a score, take +2d and increased effect. Choose one signature stunt to start. Master additional stunts each time you take this ability.' },
      { name: 'Custom Ride', desc: 'Create one vehicle as a cohort (Quality = Tier +1). The vehicle can use teamwork actions and help during downtime. It cannot lead group actions or go on secondary scores.' },
      { name: 'Escape Velocity', desc: 'One vehicle has a device that activates at a specific speed, requiring an 8-segment acceleration clock. When filled: break gravity, tear reality, enter resonance field, or travel through time.' },
      { name: 'The Family Takes a Cut', desc: 'Before payout for smuggling or hijacking, skim the goods for +4 stacks. The GM ticks a clock.' },
      { name: 'Bring Them In', desc: 'Turn enemies into family via long-term project (6 seg: contact, 10 seg: cohort or PC). Does not change their faction\'s relationship with your crew.' },
      { name: 'Speed Demons', desc: 'When you go into conflict aboard a vehicle, gain increased effect for vehicle damage and speed. If the vehicle has armor, you can use it for your own protection.' },
    ],
    claims: [
      { id: 'lair',          x: 2, y: 2, label: 'Base',             benefit: 'Your base of operations.',           defaultState: 'owned' },
      { id: 'turf_1',        x: 1, y: 2, label: 'Turf',             benefit: 'Reduces Rep cost to advance Tier.',  connections: ['lair'] },
      { id: 'turf_2',        x: 3, y: 2, label: 'Turf',             benefit: 'Reduces Rep cost to advance Tier.',  connections: ['lair'] },
      { id: 'turf_3',        x: 1, y: 3, label: 'Turf',             benefit: 'Reduces Rep cost to advance Tier.',  connections: ['turf_1'] },
      { id: 'chop_shop',     x: 2, y: 3, label: 'Chop Shop',        benefit: 'Roll Tier during personal business: earn stacks = highest result minus Heat.', connections: ['lair'] },
      { id: 'warehouse',     x: 3, y: 3, label: 'Warehouse',        benefit: '+1d to Acquire Asset rolls.',        connections: ['turf_2'] },
      { id: 'lounge_bar',    x: 1, y: 1, label: 'Lounge Bar',       benefit: '+1d to Consort and Sway on-site.',   connections: ['turf_1'] },
      { id: 'informants',    x: 3, y: 1, label: 'Informants',       benefit: '+1d to gather information.',         connections: ['turf_2'] },
      { id: 'cover_op',      x: 2, y: 1, label: 'Cover Operation',  benefit: '-2 Heat per score.',                 connections: ['lounge_bar', 'informants'] },
      { id: 'loyal_fence',   x: 0, y: 2, label: 'Loyal Fence',      benefit: '+2 stacks payout for smuggling or hijacking.', connections: ['turf_1'] },
      { id: 'secret_routes', x: 4, y: 2, label: 'Secret Routes',    benefit: '+1d to engagement (speed approaches).', connections: ['turf_2'] },
      { id: 'big_race',      x: 2, y: 0, label: 'Big Street Race',  benefit: '★ One-off vs Tier 3: 15 stack prize + 15 Rep.', connections: ['cover_op'], special: true },
      { id: 'death_race',    x: 4, y: 0, label: 'Deathlands Race',  benefit: '★ One-off vs Tier 4: 10 Rep + 15 stacks, very dangerous.', connections: ['secret_routes'], special: true },
    ],
  },

  Shadows: {
    name: 'Shadows',
    tagline: 'Covert specialists, experts in heists and espionage',
    description: 'Surveillance, heist, subterfuge, and sabotage operations.',
    xpTrigger: 'Execute a successful surveillance, heist, subterfuge, or sabotage score.',
    color: '#0891b2',
    icon: 'eye',
    startingUpgrades: ['Lair: Hidden', 'Cohort: Gang (Infiltrators)'],
    specificUpgrades: [
      { name: 'Secret Maps & Keys', desc: 'Easy passage through shadow routes — underground canals, service tunnels, and basement access hatches.' },
      { name: 'Elite Infiltrators', desc: 'All Infiltrator cohorts get +1d to Quality rolls for Infiltrator-related actions.' },
      { name: 'Elite Hustlers', desc: 'All Hustler cohorts get +1d to Quality rolls for Hustler-related actions.' },
      { name: 'Multifaceted', desc: 'Each PC gets +1 key/deadlock box. Costs three upgrades to unlock.' },
    ],
    abilities: [
      { name: 'Synchronized Watches', desc: 'Use assists or setup actions with any crew member regardless of distance. When you perform a group action, multiple 6s from different rolls count as a critical success.' },
      { name: 'Thieves With a Code', desc: 'When you complete a score with no deaths having occurred, gain +1 faction status with the local citizenry.' },
      { name: 'Sleepy Time', desc: 'Everyone adds tranquilizer rounds (0 load, compatible with any firearm) to their playbook items. Each character gets one use.' },
      { name: "Don't Forget the Duffel Bag", desc: 'Once per score, flashback to an Acquire Asset roll with +2d. Both the flashback and the downtime activity are free.' },
      { name: 'Benefactor', desc: 'Crew immediately receives 4 stacks. Whenever you advance your Tier, it costs half the stacks it normally would.' },
      { name: 'Echo Safehouse', desc: 'Access a safehouse in the resonance field once per score, from anywhere. The door returns to where it was entered. +1 load, one PC clears all level 1 harm inside. Time still passes outside.' },
      { name: 'Black Bag Operations', desc: 'When you execute a clandestine infiltration, +1d to the engagement roll. Install surveillance during a score: +1d to future gather info for that faction (until they find the bug).' },
    ],
    // Grid matches the screenshot layout exactly
    claims: [
      { id: 'lair',          x: 2, y: 4, label: 'Base',             benefit: 'Your base of operations.',           defaultState: 'owned' },
      { id: 'cover_id',      x: 0, y: 0, label: 'Cover Identities', benefit: '+1d to engagement (deception/social).',     connections: ['paid_bluecoats'] },
      { id: 'turf_1',        x: 1, y: 0, label: 'Turf',             benefit: 'Reduces Rep cost to advance Tier.',  connections: ['cover_id', 'slush_fund'] },
      { id: 'checkmate',     x: 2, y: 0, label: 'Checkmate',        benefit: '★ One-off vs Tier 5: 30 stacks + complete one crew clock.', special: true, connections: ['slush_fund'] },
      { id: 'inside_mark',   x: 3, y: 0, label: 'Inside Mark',      benefit: 'Unlocks Checkmate: target counts as -1 Tier.',             connections: ['cover_story'] },
      { id: 'secret_paths',  x: 4, y: 0, label: 'Secret Pathways',  benefit: '+1d to engagement (stealth plans).',  connections: ['inside_mark'] },
      { id: 'paid_bluecoats',x: 0, y: 1, label: 'Paid-Off Bluecoats',benefit: '-2 Heat per score.',                connections: ['lair'] },
      { id: 'interested',    x: 1, y: 1, label: 'Interested Party', benefit: 'Unlocks Checkmate: +10 stacks payout.',                   connections: ['turf_1'] },
      { id: 'slush_fund',    x: 2, y: 1, label: 'Slush Fund',       benefit: 'Roll Tier during personal business: earn stacks = highest result minus Heat.', connections: ['lair'] },
      { id: 'cover_story',   x: 3, y: 1, label: 'Cover Story',      benefit: 'Unlocks Checkmate: +2d to engagement.',                  connections: ['slush_fund'] },
      { id: 'luxury_venue',  x: 4, y: 1, label: 'Luxury Venue',     benefit: '+1d to Command and Sway on-site.',  connections: ['secret_paths'] },
      { id: 'crit_move',     x: 0, y: 2, label: 'Critical Move',    benefit: '★ One-off vs Tier 4: 15 stacks + 4 ticks on any crew clock.', special: true, connections: ['paid_bluecoats'] },
      { id: 'high_stakes',   x: 1, y: 2, label: 'High Stakes Game', benefit: 'Roll Tier: earn stacks = highest result minus Heat.',     connections: ['interested'] },
      { id: 'informants',    x: 2, y: 2, label: 'Informants',       benefit: '+1d to gather information.',         connections: ['slush_fund'] },
      { id: 'turf_2',        x: 3, y: 2, label: 'Turf',             benefit: 'Reduces Rep cost to advance Tier.',  connections: ['cover_story'] },
      { id: 'dispensary',    x: 4, y: 2, label: 'Dispensary',       benefit: '+1d to healing treatment rolls.',   connections: ['luxury_venue'] },
      { id: 'turf_3',        x: 0, y: 3, label: 'Turf',             benefit: 'Reduces Rep cost to advance Tier.',  connections: ['crit_move'] },
      { id: 'spec_fence',    x: 1, y: 3, label: 'Specialist Fence', benefit: '+2 stacks payout for heist or surveillance scores.',      connections: ['high_stakes'] },
      { id: 'lounge_bar',    x: 4, y: 3, label: 'Lounge Bar',       benefit: 'Roll Tier: earn stacks = highest result minus Heat.',     connections: ['dispensary'] },
      { id: 'covert_fixer',  x: 3, y: 3, label: 'Covert Fixer',    benefit: '+2 stacks payout for surveillance or sabotage scores.',   connections: ['turf_2'] },
    ],
  },

  Utopians: {
    name: 'Utopians',
    tagline: 'A new age cult dedicated to an unsettling vision of the future',
    description: 'Discovery, stabilization, and experimentation with paranormal anomalies.',
    xpTrigger: 'Advance the realization of your Utopian Vision.',
    color: '#9333ea',
    icon: 'star',
    startingUpgrades: ['Training: Resolve', 'Cohort: Gang (Eggheads)'],
    specificUpgrades: [
      { name: 'Utopian Rigging', desc: '2 free load worth of documents or paranormal implements.' },
      { name: 'Elite Eggheads', desc: 'All Egghead cohorts get +1d to Quality rolls for Egghead-related actions.' },
      { name: 'Elite Muscle', desc: 'All Muscle cohorts get +1d to Quality rolls for Muscle-related actions.' },
      { name: 'Awakened', desc: 'Each PC gets +1 key/deadlock box. Costs three upgrades to unlock.' },
    ],
    circles: ['First Circle', 'Second Circle', 'Third Circle', 'Final Circle'],
    circleRequirements: {
      'First Circle': null,
      'Second Circle': 'Threshold of Gold: crew has earned 20+ total stacks',
      'Third Circle': 'Threshold of Blood: crew has ended 10+ lives (tracked from start)',
      'Final Circle': 'Threshold of Power: crew is Tier 3+ AND has created a major anomaly',
    },
    abilities: [
      { name: 'Enlightened', circle: 'First Circle', desc: '+1d to resistance rolls against paranormal threats. +1d to healing rolls when you have paranormal harm.' },
      { name: 'Commune', circle: 'First Circle', desc: 'Use teamwork with any crew member regardless of distance. Take 1 Stress: project thoughts as telepathic communication to all crew.' },
      { name: 'Best Intentions', circle: 'First Circle', desc: 'If every PC vows not to kill before a score, take +1d to engagement. First time each PC might kill, they take +1d and potency. Keep the vow: crew marks 1 xp.' },
      { name: 'Zeal', circle: 'First Circle', desc: 'Every PC gets +1d and potency when they evangelize about the Utopian Vision. Evangelizing must be the point of the action.' },
      { name: 'True Believers', circle: 'Second Circle', desc: 'Cohorts will undertake any service, no matter how dangerous or strange. They gain +1d to rolls against enemies of the Utopian Vision.' },
      { name: 'Altered States', circle: 'Second Circle', desc: 'Each PC gains Ritual Hedonism as an additional vice. When indulged, don\'t overindulge if you clear excess Stress. Ecstatic visions: perform one free flashback.' },
      { name: 'For the Greater Good', circle: 'Third Circle', desc: 'A human sacrifice removes Stress cost for any paranormal experiment you perform. Such sacrifices in your base don\'t trigger the Death Radar or generate Heat.' },
      { name: 'This Is Fine', circle: 'Third Circle', desc: 'If every PC works together (group action), you can summon a Class V Resonance Entity. It counts as Tier 5 but does not automatically obey you.' },
      { name: 'Remember the Forgotten', circle: 'Final Circle', desc: 'You can now communicate with the entity that created your Utopian Vision. Tread carefully.' },
      { name: 'Paradise Manifest', circle: 'Final Circle', desc: 'Your base transforms into a fragment of your utopia. +2d to engagement for any raids. All crew gain potency at base. All downtime actions at base get +1 result level.' },
      { name: 'We No Longer Play By Your Rules', circle: 'Final Circle', desc: 'When you take this advance, immediately pick two more advances.' },
    ],
    claims: [
      // First Circle (row 0)
      { id: 'wellness',    x: 0, y: 0, label: 'Wellness Class',  benefit: 'Roll Tier: earn stacks = highest result minus Heat.', circle: 'First Circle' },
      { id: 'turf_f1',     x: 1, y: 0, label: 'Turf',            benefit: 'Reduces Rep cost to advance Tier (-1).', circle: 'First Circle', connections: ['wellness', 'lair'] },
      { id: 'lair',        x: 2, y: 0, label: 'Base',             benefit: 'Your base of operations.', defaultState: 'owned', circle: 'First Circle' },
      { id: 'turf_f2',     x: 3, y: 0, label: 'Turf',            benefit: 'Reduces Rep cost to advance Tier (-1).', circle: 'First Circle', connections: ['lair', 'luxury_ret'] },
      { id: 'luxury_ret',  x: 4, y: 0, label: 'Luxury Retreat',  benefit: 'Egghead cohorts get +1 scale.', circle: 'First Circle' },
      // Second Circle (row 1)
      { id: 'donations',   x: 0, y: 1, label: 'Donations',       benefit: '+2 stacks payout for paranormal scores.', circle: 'Second Circle', connections: ['wellness'] },
      { id: 'turf_s1',     x: 1, y: 1, label: 'Turf',            benefit: 'Reduces Rep cost to advance Tier (-1).', circle: 'Second Circle', connections: ['turf_f1', 'donations'] },
      { id: 'temple',      x: 2, y: 1, label: 'Temple',          benefit: '+1d to Command and Sway on-site.', circle: 'Second Circle', connections: ['lair'] },
      { id: 'turf_s2',     x: 3, y: 1, label: 'Turf',            benefit: 'Reduces Rep cost to advance Tier (-1).', circle: 'Second Circle', connections: ['turf_f2'] },
      { id: 'nat_healer',  x: 4, y: 1, label: 'Natural Healer',  benefit: '+1d to healing treatment rolls.', circle: 'Second Circle', connections: ['luxury_ret'] },
      // Third Circle (row 2)
      { id: 'aband_lab',   x: 0, y: 2, label: 'Abandoned Lab',   benefit: '+1d to Attune rolls on-site (action and downtime).', circle: 'Third Circle', connections: ['donations'] },
      { id: 'anc_altar',   x: 1, y: 2, label: 'Ancient Altar',   benefit: '+1d to engagement (paranormal approaches).', circle: 'Third Circle', connections: ['turf_s1'] },
      { id: 'reality_shift', x: 2, y: 2, label: 'Reality Shift Tower', benefit: 'Anomaly claim: can be targeted, captured, and stabilized.', circle: 'Third Circle', special: true, connections: ['temple'] },
      { id: 'anc_gate',    x: 3, y: 2, label: 'Ancient Gate',    benefit: 'Safe secret passage out of the Bubble.', circle: 'Third Circle', connections: ['turf_s2'] },
      { id: 'anc_tower',   x: 4, y: 2, label: 'Ancient Tower',   benefit: '+1d to Attune rolls, and Attune can be used to gather info.', circle: 'Third Circle', connections: ['nat_healer'] },
      // Final Circle (row 3)
      { id: 'anc_tomes',   x: 0, y: 3, label: 'Ancient Tomes',   benefit: 'Unlocks Reality Tear: +2d to engagement roll.', circle: 'Final Circle', connections: ['aband_lab'] },
      { id: 'notable_sk',  x: 1, y: 3, label: 'Notable Skeptic', benefit: 'Unlocks Reality Tear: +4 Rep payout.', circle: 'Final Circle', connections: ['anc_altar'] },
      { id: 'reality_tear',x: 2, y: 3, label: 'Reality Tear',    benefit: '★ One-off vs Tier 5: creates a new mega anomaly.', special: true, circle: 'Final Circle', connections: ['reality_shift'] },
      { id: 'figurehead',  x: 3, y: 3, label: 'Figurehead',      benefit: 'Send them to Ironhook to remove 3 Wanted Levels from crew.', circle: 'Final Circle', connections: ['anc_gate'] },
      { id: 'interested',  x: 4, y: 3, label: 'Interested Party', benefit: 'Unlocks Reality Tear: +6 stacks payout.', circle: 'Final Circle', connections: ['anc_tower'] },
    ],
  },
};

// ─── UPGRADE DATA ─────────────────────────────────────────────────────────────

const GENERAL_UPGRADES = [
  { category: 'Lair', items: [
    { name: 'Hidden',    desc: 'Your base is secret. If raided, enemies must first discover where it is.' },
    { name: 'Quarters',  desc: 'Living quarters for the crew. Whenever the crew unwinds, clear all passing harm.' },
    { name: 'Secure',    desc: 'Hardened against intrusion and raids.' },
    { name: 'Vault',     desc: 'Increases stacks storage capacity to 8. A second upgrade increases to 16.' },
  ]},
  { category: 'Quality', items: [
    { name: 'Documents',              desc: 'Improves Quality of all Documents items.' },
    { name: 'Gear',                   desc: 'Improves Quality of Burglary Gear and Climbing Gear.' },
    { name: 'Paranormal Implements',  desc: 'Improves Quality of Paranormal Implements.' },
    { name: 'Subterfuge Supplies',    desc: 'Improves Quality of Subterfuge Supplies.' },
    { name: 'Tools',                  desc: 'Improves Quality of Demolitions Tools and Tinkering Tools.' },
    { name: 'Weapons',                desc: 'Improves Quality of all Weapons.' },
  ]},
  { category: 'Training', items: [
    { name: 'Insight',   desc: 'Earn 2 xp (instead of 1) when you train Insight during downtime.' },
    { name: 'Prowess',   desc: 'Earn 2 xp (instead of 1) when you train Prowess during downtime.' },
    { name: 'Resolve',   desc: 'Earn 2 xp (instead of 1) when you train Resolve during downtime.' },
    { name: 'Playbook',  desc: 'Earn 2 xp (instead of 1) when you train your Playbook track during downtime.' },
  ]},
];

// ─── COHORT DATA ──────────────────────────────────────────────────────────────

const COHORT_TYPES    = ['Gang', 'Expert'];
const GANG_SUBTYPES   = ['Eggheads', 'Hustlers', 'Runners', 'Infiltrators', 'Muscle'];
const COHORT_EDGES    = ['Fearsome', 'Independent', 'Loyal', 'Resourceful', 'Tenacious', 'Vigilant'];
const COHORT_FLAWS    = ['Principled', 'Ruthless', 'Clumsy', 'Hedonistic', 'Panicky', 'Superstitious', 'Mutinous'];
const COHORT_STATUSES = ['healthy', 'weakened', 'impaired', 'broken', 'dead'];
const STATUS_COLORS   = {
  healthy:  'text-green-400 border-green-900 bg-green-950/30',
  weakened: 'text-yellow-400 border-yellow-900 bg-yellow-950/30',
  impaired: 'text-orange-400 border-orange-900 bg-orange-950/30',
  broken:   'text-red-400 border-red-900 bg-red-950/30',
  dead:     'text-neutral-600 border-neutral-800 bg-neutral-900/30',
};

const SECONDARY_OUTCOMES = [
  { range: '1–3', label: 'Failure',  color: 'text-red-400',    border: 'border-red-900',    desc: 'Score fails. Cohort marks harm = half the payout (rounded down). Consider Heat, faction status, clock ticks.' },
  { range: '4/5', label: 'Partial',  color: 'text-orange-400', border: 'border-orange-900', desc: 'Success, cohort marks 1 harm, crew takes 3 Heat, crew gains 1 Rep. Cohort gets paid their cut.' },
  { range: '6',   label: 'Success',  color: 'text-green-400',  border: 'border-green-900',  desc: 'Success, cohort returns unharmed. Crew takes 2 Heat. Crew gains 2 Rep. Cohort gets paid their cut.' },
  { range: 'Crit',label: 'Critical', color: 'text-blue-400',   border: 'border-blue-900',   desc: 'Success with zero Heat. Cohort achieves something extra. Crew gains 2 Rep. Cohort gets paid their cut.' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const generateInviteCode = () => {
  const words = ['VIPER','WOLF','CROW','IRON','GHOST','RAVEN','BLADE','SHADOW','STORM','NEON'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num  = Math.floor(Math.random() * 900 + 100);
  return `${word}-${num}`;
};

const defaultCrew = (name, templateId, characterId, ownerId) => {
  const t = CREW_TEMPLATES[templateId];
  const claimsState = {};
  t.claims.forEach(c => { claimsState[c.id] = { status: c.defaultState === 'owned' ? 'owned' : 'locked', notes: '' }; });
  return {
    id: Date.now().toString(),
    name, templateId, characterId,
    tier: 0, rep: 0, heat: 0, wanted: 0, stacks: 0,
    claimsState, cohorts: [],
    upgrades: [...t.startingUpgrades],
    wardBoss: { name: '', notes: '', tier: 1, anger: 0 },
    utopianCircle: 'First Circle',
    utopianVision: '',
    inviteCode: generateInviteCode(),
    ownerId: ownerId || '',
    memberId: [],
    memberDisplayNames: {},
  };
};

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────

const Tracker = ({ value, max, onChange, color = 'bg-red-600 border-red-600' }) => (
  <div className="flex gap-1 items-center flex-wrap">
    {Array.from({ length: max }).map((_, i) => (
      <button key={i} onClick={() => onChange(value === i + 1 ? i : i + 1)}
        className={`w-3 h-3 rounded-sm border transition-colors ${i < value ? color : 'bg-transparent border-neutral-700 hover:border-neutral-400'}`} />
    ))}
  </div>
);

const ClockSVG = ({ segments, filled, size = 48, fillColor = '#dc2626' }) => {
  const r = 44, cx = 50, cy = 50;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="cursor-pointer hover:scale-105 transition-transform">
      <circle cx="50" cy="50" r="44" fill="var(--bg1)" stroke="var(--border)" strokeWidth="2" />
      {Array.from({ length: segments }).map((_, i) => {
        const a1 = (i * 360 / segments - 90) * Math.PI / 180;
        const a2 = ((i + 1) * 360 / segments - 90) * Math.PI / 180;
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
        const large = (360 / segments) > 180 ? 1 : 0;
        return (
          <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={i < filled ? fillColor : 'transparent'} stroke="var(--border)" strokeWidth="2" />
        );
      })}
    </svg>
  );
};

function CollapsibleSection({ title, icon, count, defaultOpen = true, children, accent }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-neutral-800/60 rounded-xl">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[var(--bg0)] hover:bg-neutral-800/20 transition-colors">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-500">
          {icon} {title}
          {count > 0 && <span className="ml-1 px-1.5 py-0.5 bg-neutral-800 rounded-full text-[9px] text-neutral-400">{count}</span>}
        </div>
        {open ? <ChevronDown size={12} className="text-neutral-600" /> : <ChevronRight size={12} className="text-neutral-600" />}
      </button>
      {open && <div className="p-2.5">{children}</div>}
    </div>
  );
}

// ─── CLAIMS GRID ─────────────────────────────────────────────────────────────

function ClaimsGrid({ claims, onNodeSelect, selectedNodeId, accentColor }) {
  const cols = 5, rows = 5;
  const [gravId, setGravId] = useState(null);

  const gridBounds = useMemo(() => {
    const xs = claims.map(c => c.x), ys = claims.map(c => c.y);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  }, [claims]);

  const lines = useMemo(() => {
    const result = [];
    const nodeW = 78 / cols; // % of grid
    const nodeH = 78 / rows;
    claims.forEach(c => {
      (c.connections || []).forEach(tid => {
        const t = claims.find(x => x.id === tid);
        if (!t) return;
        const cx1 = (c.x + 0.5) * (100 / cols);
        const cy1 = (c.y + 0.5) * (100 / rows);
        const cx2 = (t.x + 0.5) * (100 / cols);
        const cy2 = (t.y + 0.5) * (100 / rows);
        // Vector from c to t
        const dx = cx2 - cx1, dy = cy2 - cy1;
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        const ux = dx/len, uy = dy/len;
        // Offset endpoints to stop at node edge (half node size)
        const ox = ux * nodeW * 0.5, oy = uy * nodeH * 0.5;
        result.push({
          id: `${c.id}-${t.id}`,
          x1: cx1 + ox, y1: cy1 + oy,
          x2: cx2 - ox, y2: cy2 - oy,
          active: c.status === 'owned' && t.status === 'owned',
        });
      });
    });
    return result;
  }, [claims]);

  const handleClick = (id) => { setGravId(id); onNodeSelect(id); setTimeout(() => setGravId(null), 300); };

  return (
    <div className="relative w-full" style={{ aspectRatio: "1/1", maxWidth: "min(100%, 600px)" }}>
      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)', backgroundSize: '20% 20%' }} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {lines.map(l => (
          <line key={l.id}
            x1={`${l.x1}%`} y1={`${l.y1}%`} x2={`${l.x2}%`} y2={`${l.y2}%`}
            stroke={l.active ? accentColor : 'var(--border)'}
            strokeWidth={l.active ? '3' : '1.5'}
            strokeDasharray={l.active ? 'none' : '4,4'}
            className="transition-all duration-300"
          />
        ))}
      </svg>

      {claims.map(claim => {
        const isOwned = claim.status === 'owned';
        const isAvail = claim.status === 'available';
        const isSel   = selectedNodeId === claim.id;
        let gx = 0, gy = 0, gScale = 1;
        if (gravId && gravId !== claim.id) {
          const center = claims.find(c => c.id === gravId);
          if (center) {
            const isAdj = center.connections?.includes(claim.id) || claim.connections?.includes(center.id);
            const dx = center.x - claim.x, dy = center.y - claim.y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            if (isAdj) {
              // Adjacent nodes pull toward clicked node
              gx = (dx / dist) * 14;
              gy = (dy / dist) * 14;
              gScale = 1.04;
            } else if (dist <= 2) {
              // Near nodes get slight repulsion
              gx = -(dx / dist) * 4;
              gy = -(dy / dist) * 4;
            }
          }
        }
        const isGravCenter = gravId === claim.id;

        return (
          <div key={claim.id}
            className={`absolute ${isSel ? 'z-30' : 'z-10 hover:z-20'}`}
            style={{
              left: `${(claim.x + 0.5) * (100 / cols)}%`,
              top:  `${(claim.y + 0.5) * (100 / rows)}%`,
              transform: `translate(calc(-50% + ${gx}px), calc(-50% + ${gy}px)) scale(${isGravCenter ? 1.08 : gScale})`,
              width: `${78 / cols}%`,
              height: `${78 / rows}%`,
              transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
            <button onClick={() => handleClick(claim.id)}
              className={`w-full h-full flex flex-col items-center justify-center rounded-lg border-2 transition-all shadow-lg
                ${isSel ? 'ring-2 ring-offset-1 ring-offset-[var(--bg0)]' : ''}
                ${isOwned ? 'border-2' : isAvail ? 'border-neutral-500 hover:border-neutral-200' : 'border-neutral-800 hover:border-neutral-700'}
                ${claim.special && isOwned ? 'shadow-[0_0_12px_rgba(255,255,255,0.1)]' : ''}`}
              style={{
                backgroundColor: 'var(--bg0)',
                borderColor: isOwned ? accentColor : undefined,
                boxShadow: isOwned ? `inset 0 0 10px ${accentColor}18` : undefined,
                ringColor: isSel ? accentColor : undefined,
              }}>
              {claim.special && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: accentColor }}>
                  <Star size={7} className="text-white" fill="currentColor" />
                </div>
              )}
              {claim.circle && (
                <div className="absolute top-0.5 left-1 text-[7px] font-black uppercase tracking-wider opacity-40">
                  {claim.circle?.replace(' Circle', '')}
                </div>
              )}
              <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-center px-1 leading-tight ${isOwned ? '' : 'text-neutral-500'}`}
                style={{ color: isOwned ? accentColor : undefined }}>
                {claim.label}
              </span>
              <div className="flex gap-1 items-center mt-0.5">
                {isOwned ? <CheckCircle size={11} style={{ color: accentColor }} />
                  : isAvail ? <Edit3 size={11} className="text-neutral-400" />
                  : <Lock size={11} className="text-neutral-700" />}
                {claim.notes && <FileText size={9} className="text-neutral-700" />}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── NODE MODAL ───────────────────────────────────────────────────────────────

function NodeModal({ node, onClose, onUpdate, accentColor }) {
  const [notes, setNotes] = useState(node.notes || '');
  const isLair = node.id === 'lair';
  const toggleStatus = () => {
    if (node.status === 'available') onUpdate({ status: 'owned' });
    else if (node.status === 'owned' && !isLair) onUpdate({ status: 'available' });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[var(--bg2)] border border-neutral-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center" style={{ borderTopColor: accentColor, borderTopWidth: 3 }}>
          <div className="flex items-center gap-2">
            {node.special && <Star size={14} style={{ color: accentColor }} fill="currentColor" />}
            <h3 className="font-black uppercase tracking-widest text-neutral-100 text-sm">{node.label}</h3>
            {node.circle && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-neutral-700 text-neutral-500">{node.circle}</span>}
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4 overflow-y-auto hide-scroll">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border w-fit ${
                node.status === 'owned' ? 'border-neutral-700 text-neutral-300' : node.status === 'available' ? 'bg-neutral-800 border-neutral-500 text-neutral-200' : 'bg-[var(--bg0)] border-neutral-800 text-neutral-600'}`}
                style={node.status === 'owned' ? { borderColor: accentColor + '80', color: accentColor, background: accentColor + '15' } : {}}>
                {node.status}
              </span>
              {node.status === 'locked' && node.connections && node.connections.length > 0 && (
                <p className="text-[10px] text-neutral-600 italic">
                  Requires: {node.connections.join(', ').replace(/_/g, ' ')}
                </p>
              )}
              {node.status === 'locked' && (!node.connections || node.connections.length === 0) && (
                <p className="text-[10px] text-neutral-600 italic">
                  Claim an adjacent node first.
                </p>
              )}
            </div>
            {node.status === 'available' && (
              <button onClick={toggleStatus} className="px-4 py-1.5 border rounded-lg uppercase font-black text-[10px] tracking-widest transition-colors hover:opacity-80"
                style={{ borderColor: accentColor, color: accentColor, background: accentColor + '15' }}>
                Claim
              </button>
            )}
            {node.status === 'owned' && !isLair && (
              <button onClick={toggleStatus} className="px-4 py-1.5 border border-neutral-700 text-neutral-500 hover:text-neutral-300 hover:border-neutral-500 rounded-lg uppercase font-black text-[10px] tracking-widest transition-colors">
                Release
              </button>
            )}
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500 block mb-1.5">Benefit</span>
            <p className="text-neutral-300 bg-[var(--bg0)] p-3 border border-neutral-800 rounded-xl text-sm leading-relaxed">{node.benefit}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500 block mb-1.5">Notes</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full h-24 border border-neutral-800 rounded-xl p-3 text-xs outline-none resize-none hide-scroll"
              style={{ background: 'var(--bg0)', color: 'var(--text-dim)', colorScheme: 'inherit' }}
              placeholder="Track NPCs, heat, operational details..." />
          </div>
        </div>
        <div className="p-4 border-t border-neutral-800 flex justify-end">
          <button onClick={() => { onUpdate({ notes }); onClose(); }}
            className="px-5 py-2 bg-neutral-200 text-black font-black uppercase tracking-widest text-xs rounded-lg hover:bg-white transition-colors">
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WARD BOSS MODAL ──────────────────────────────────────────────────────────

function WardBossModal({ wardBoss, onUpdate, onClose }) {
  const [local, setLocal] = useState({ name: '', notes: '', tier: 1, anger: 0, ...wardBoss });
  const upd = (k, v) => setLocal(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="bg-[var(--bg2)] border border-neutral-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-2"><Crown size={16} className="text-amber-500" /><h3 className="font-black uppercase tracking-widest text-neutral-100 text-sm">Ward Boss</h3></div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-5 overflow-y-auto hide-scroll">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1.5">Name / Faction</label>
              <input value={local.name} onChange={e => upd('name', e.target.value)}
                className="w-full border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-900/60"
                style={{ background: 'var(--bg0)', color: 'var(--text)', colorScheme: 'inherit' }}
                placeholder="e.g. The Lampblacks" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1.5">Their Tier</label>
              <div className="flex items-center gap-2">
                <button onClick={() => upd('tier', Math.max(0, local.tier - 1))} className="w-7 h-7 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white"><Minus size={12} /></button>
                <span className="font-black text-white text-lg w-6 text-center">{local.tier}</span>
                <button onClick={() => upd('tier', Math.min(5, local.tier + 1))} className="w-7 h-7 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white"><Plus size={12} /></button>
              </div>
            </div>
          </div>
          <div className="bg-[var(--bg0)] border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Anger Clock</span>
                <span className="text-[10px] text-neutral-600">+1 tick when you skip the tithe. Fill = lose 1 faction status.</span>
              </div>
              <button onClick={() => upd('anger', (local.anger + 1) % 5)}>
                <ClockSVG segments={4} filled={local.anger} size={52} fillColor={local.anger >= 4 ? '#ef4444' : '#f97316'} />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Tithe: <span className="text-neutral-300 font-bold">Tier + 1 stacks per score</span></span>
              <button onClick={() => upd('anger', 0)} className="text-[10px] text-neutral-600 hover:text-neutral-400">Reset</button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1.5">Notes</label>
            <textarea value={local.notes} onChange={e => upd('notes', e.target.value)}
              className="w-full h-24 border border-neutral-800 rounded-xl p-3 text-xs outline-none resize-none hide-scroll"
              style={{ background: 'var(--bg0)', color: 'var(--text-dim)', colorScheme: 'inherit' }}
              placeholder="Relationship, demands, reprisals, contacts..." />
          </div>
          <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 text-xs text-neutral-400 leading-relaxed">
            <span className="font-black text-amber-500 block mb-1">Becoming Ward Boss</span>
            Once you supplant the ward boss (through war and surrender), you no longer pay tithe. Instead gain 1 stack every downtime in tithes from smaller crews.
          </div>
        </div>
        <div className="p-4 border-t border-neutral-800 flex justify-end">
          <button onClick={() => { onUpdate(local); onClose(); }}
            className="px-5 py-2 bg-neutral-200 text-black font-black uppercase tracking-widest text-xs rounded-lg hover:bg-white transition-colors">
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SECONDARY SCORE MODAL ────────────────────────────────────────────────────

function SecondaryScoreModal({ cohort, onClose }) {
  const [result, setResult] = useState(null);
  const roll = () => {
    const dice = Array.from({ length: Math.max(1, cohort.quality || 1) }, () => Math.ceil(Math.random() * 6));
    const best = Math.max(...dice);
    let outcome;
    if (dice.filter(d => d === 6).length >= 2) outcome = SECONDARY_OUTCOMES[3];
    else if (best === 6) outcome = SECONDARY_OUTCOMES[2];
    else if (best >= 4) outcome = SECONDARY_OUTCOMES[1];
    else outcome = SECONDARY_OUTCOMES[0];
    setResult({ dice, best, outcome });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[var(--bg2)] border border-neutral-700 rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-2"><Dices size={15} className="text-neutral-500" /><h3 className="font-black uppercase tracking-widest text-neutral-100 text-sm">Secondary Score</h3></div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="text-center">
            <span className="text-[10px] text-neutral-500 uppercase font-black tracking-widest block">{cohort.name}</span>
            <span className="text-xs text-neutral-400">Quality {cohort.quality || 1} · Roll {cohort.quality || 1}d6</span>
          </div>
          {!result ? (
            <>
              <div className="space-y-1.5">
                {SECONDARY_OUTCOMES.map(o => (
                  <div key={o.range} className={`flex gap-3 items-start text-xs bg-[var(--bg0)] border ${o.border} rounded-xl p-2.5`}>
                    <span className={`font-black shrink-0 w-8 ${o.color}`}>{o.range}</span>
                    <span className="text-neutral-400 leading-snug">{o.desc}</span>
                  </div>
                ))}
              </div>
              <button onClick={roll} className="w-full py-3 bg-neutral-200 text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2">
                <Dices size={16} /> Roll Quality
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="flex gap-2 justify-center flex-wrap">
                {result.dice.map((d, i) => (
                  <div key={i} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-black text-lg
                    ${d === result.best ? `bg-[var(--bg1)] text-white` : 'bg-[var(--bg0)] border-neutral-700 text-neutral-500'}`}
                    style={d === result.best ? { borderColor: result.outcome.color.replace('text-', '').replace('-400', '') } : {}}>
                    {d}
                  </div>
                ))}
              </div>
              <div className={`text-center p-4 bg-[var(--bg0)] rounded-xl border ${result.outcome.border}`}>
                <span className={`font-black text-xl uppercase tracking-widest ${result.outcome.color}`}>{result.outcome.label}</span>
                <p className="text-neutral-400 text-xs mt-2 leading-relaxed">{result.outcome.desc}</p>
              </div>
              <button onClick={() => setResult(null)} className="w-full py-2 border border-neutral-700 text-neutral-400 font-black uppercase tracking-widest text-xs rounded-xl hover:border-neutral-500 transition-colors">
                Roll Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ACTIVE BENEFITS CHIPS ───────────────────────────────────────────────────

function ActiveBenefitsChips({ claimBenefits, upgradeBenefits, upgradeDescs = {}, accentColor }) {
  const [expanded, setExpanded] = useState(null);
  const allBenefits = [
    ...claimBenefits.filter(c => c.id !== 'lair').map(c => ({
      id: c.id, label: c.label, detail: c.benefit.replace('★ ', ''), type: 'claim', special: c.special,
    })),
    ...upgradeBenefits.map(u => ({
      id: u, label: u, detail: upgradeDescs[u] || u, type: 'upgrade', special: false,
    })),
  ];

  return (
    <div className="border border-neutral-800/60 rounded-xl">
      <div className="px-3 py-2 bg-[var(--bg0)] rounded-t-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-800/60">
        <Zap size={11} className="text-neutral-500" /> Active Benefits
        <span className="ml-1 px-1.5 py-0.5 bg-neutral-800 rounded-full text-[9px] text-neutral-400">{allBenefits.length}</span>
      </div>
      {allBenefits.length === 0 ? (
        <div className="p-2.5"><p className="text-[11px] text-neutral-600 italic">No territory or upgrades yet.</p></div>
      ) : (
        <div className="p-2 space-y-1">
          {/* Chips row - always visible */}
          <div className="flex flex-wrap gap-1.5">
            {allBenefits.map(b => {
              const isOpen = expanded === b.id;
              return (
                <button key={b.id}
                  onClick={() => setExpanded(isOpen ? null : b.id)}
                  className="px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all"
                  style={{
                    borderColor: isOpen ? accentColor : 'var(--border)',
                    background: isOpen ? accentColor + '18' : 'var(--bg2)',
                    color: isOpen ? accentColor : '#737373',
                  }}>
                  {b.special ? '★ ' : ''}{b.label}
                </button>
              );
            })}
          </div>
          {/* Expanded detail - shows below chips */}
          {expanded && (() => {
            const b = allBenefits.find(x => x.id === expanded);
            if (!b) return null;
            return (
              <div className="px-3 py-2.5 rounded-lg border text-[11px] text-neutral-300 leading-relaxed"
                style={{ borderColor: accentColor + '40', background: accentColor + '0d' }}>
                <span className="block text-[9px] font-black uppercase tracking-widest mb-1"
                  style={{ color: accentColor }}>{b.label}</span>
                {b.detail}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─── CREW DASHBOARD ───────────────────────────────────────────────────────────

// ─── SHARE CREW MODAL ─────────────────────────────────────────────────────────

function ShareCrewModal({ crew, onClose }) {
  const [copied, setCopied] = useState(false);
  const code = crew.inviteCode || '—';

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="bg-[var(--bg2)] border border-neutral-700 rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Share2 size={15} className="text-neutral-400" />
            <h3 className="font-black uppercase tracking-widest text-neutral-100 text-sm">Invite to Crew</h3>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-neutral-400 leading-relaxed">
            Share this code with players you want to invite. They can enter it from the Crews screen to request to join.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[var(--bg0)] border border-neutral-700 rounded-xl px-4 py-3 text-center">
              <span className="font-black text-2xl tracking-widest text-white">{code}</span>
            </div>
            <button onClick={handleCopy}
              className="flex flex-col items-center gap-1 p-3 border border-neutral-700 rounded-xl hover:border-neutral-500 transition-colors min-w-[56px]"
              style={copied ? { borderColor: '#22c55e', background: '#052e16' } : {}}>
              <Copy size={16} className={copied ? 'text-green-400' : 'text-neutral-400'} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: copied ? '#4ade80' : '#737373' }}>
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>
          </div>
          <div className="bg-[var(--bg0)] border border-neutral-800 rounded-xl p-3 text-xs text-neutral-500 leading-relaxed">
            Once a player requests to join, you'll see their request in this crew's Members section and can approve or deny it.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── JOIN CREW MODAL ──────────────────────────────────────────────────────────

function JoinCrewModal({ userId, characters, onJoined, onClose }) {
  const [code, setCode]       = useState('');
  const [status, setStatus]   = useState('idle');
  const [foundCrew, setFoundCrew] = useState(null);
  const [selectedCharId, setSelectedCharId] = useState(characters[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState('');

  const searchCode = async () => {
    if (!code.trim()) return;
    setStatus('searching');
    setFoundCrew(null);
    setErrorMsg('');
    try {
      const result = await crewApi.join(code.trim().toUpperCase());
      setFoundCrew(result);
      setStatus('sent');
      setTimeout(() => onJoined(), 1200);
    } catch (err) {
      setErrorMsg(`No crew found with that code, or join failed: ${err.message || 'Try again.'}`);
      setStatus('error');
    }
  };

  // sendRequest is now merged into searchCode via crewApi.join
  const sendRequest = () => {};

  const tmpl = foundCrew ? CREW_TEMPLATES[foundCrew.templateId] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="bg-[var(--bg2)] border border-neutral-700 rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserPlus size={15} className="text-neutral-400" />
            <h3 className="font-black uppercase tracking-widest text-neutral-100 text-sm">Join a Crew</h3>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={18} /></button>
        </div>

        {status === 'sent' ? (
          <div className="p-6 flex flex-col items-center gap-3 text-center">
            <UserCheck size={32} className="text-green-400" />
            <p className="font-black uppercase tracking-widest text-white">Request Sent!</p>
            <p className="text-sm text-neutral-400">The crew owner will review your request. You'll be able to access the crew once approved.</p>
            <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-neutral-200 text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-colors">Done</button>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && searchCode()}
                placeholder="CREW CODE"
                className="flex-1 border border-neutral-700 rounded-xl px-4 py-3 font-black text-lg tracking-widest text-center outline-none"
                style={{ background: 'var(--bg0)', color: 'var(--text)', colorScheme: 'inherit', letterSpacing: '0.15em' }}
              />
              <button onClick={searchCode} disabled={status === 'searching'}
                className="px-4 py-3 bg-neutral-200 text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-colors disabled:opacity-50">
                {status === 'searching' ? '...' : 'Find'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-400 text-center">{errorMsg}</p>
            )}

            {status === 'found' && foundCrew && tmpl && (
              <div className="flex flex-col gap-3 animate-fade-in">
                <div className="bg-[var(--bg0)] border rounded-xl p-4" style={{ borderColor: tmpl.color + '60' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <CrewIcon id={tmpl.icon} size={16} color={tmpl.color} />
                    <span className="font-black text-sm uppercase tracking-widest text-white">{foundCrew.name}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: tmpl.color }}>{tmpl.name}</span>
                </div>

                {characters.length > 1 && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1.5">Join as</label>
                    <select value={selectedCharId} onChange={e => setSelectedCharId(e.target.value)}
                      className="w-full border border-neutral-700 rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{ background: 'var(--bg0)', color: 'var(--text)', colorScheme: 'inherit' }}>
                      {characters.map(c => <option key={c.id} value={c.id}>{c.name} · {c.playbook}</option>)}
                    </select>
                  </div>
                )}

                <button onClick={sendRequest} disabled={status === 'sending'}
                  className="w-full py-3 bg-neutral-200 text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white transition-colors disabled:opacity-50">
                  {status === 'sending' ? 'Sending...' : 'Request to Join'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MEMBERS PANEL (inside crew dashboard, owner only) ────────────────────────

function MembersPanel({ crew, userId, onUpdate }) {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [memberNames, setMemberNames] = useState({});
  const isOwner = crew.ownerId === userId;

  const loadRequests = () => {
    // TODO: wire to api/client crewRequests endpoint when backend is live
    setLoading(false);
    setRequests([]);
  };

  // Fetch character names for all members
  useEffect(() => {
    const memberList = Array.isArray(crew.memberId) ? crew.memberId : [];
    if (memberList.length === 0) return;
    // Use stored display names (set at approval time)
    const stored = crew.memberDisplayNames || {};
    setMemberNames(stored);
    setLoading(false);
  }, [crew.memberId]);

  useEffect(() => { loadRequests(); }, [crew.id]);

  const handleApprove = async (req) => {
    try {
      // TODO: wire to api/client when crewRequests endpoint is live
      const newMemberList = [...(crew.memberId || []), req.requesterId];
      const newDisplayNames = { ...(crew.memberDisplayNames || {}), [req.requesterId]: req.requesterName };
      onUpdate({ memberId: newMemberList, memberDisplayNames: newDisplayNames });
      setMemberNames(prev => ({ ...prev, [req.requesterId]: req.requesterName }));
      setRequests(prev => prev.filter(r => r.id !== req.id));
    } catch (err) { console.error('Approve failed:', err); }
  };

  const handleDeny = async (req) => {
    // TODO: wire to api/client when crewRequests endpoint is live
    setRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const handleKick = async (memberId) => {
    if (!confirm('Remove this member from the crew?')) return;
    const newMemberList = (crew.memberId || []).filter(id => id !== memberId);
    const newDisplayNames = { ...(crew.memberDisplayNames || {}) };
    delete newDisplayNames[memberId];
    onUpdate({ memberId: newMemberList, memberDisplayNames: newDisplayNames });
  };

  const memberList = crew.memberId || [];

  return (
    <div className="flex flex-col gap-3">
      {/* Pending requests — owner only */}
      {isOwner && !loading && requests.length > 0 && (
        <div className="bg-[var(--bg2)] border border-amber-900/40 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
              <Clock size={11} /> Pending Requests ({requests.length})
            </h4>
            <button onClick={loadRequests} className="text-[9px] font-black uppercase tracking-widest text-neutral-600 hover:text-neutral-300 transition-colors px-2 py-1 border border-neutral-800 rounded-lg">
              Refresh
            </button>
          </div>
          <div className="space-y-2">
            {requests.map(req => (
              <div key={req.id} className="flex items-center justify-between gap-3 bg-[var(--bg0)] border border-neutral-800 rounded-xl px-3 py-2.5">
                <span className="text-sm font-bold text-neutral-200">{req.requesterName}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => handleApprove(req)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-950/40 border border-green-900/60 text-green-400 hover:bg-green-950/60 transition-colors">
                    <UserCheck size={11} /> Approve
                  </button>
                  <button onClick={() => handleDeny(req)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/60 transition-colors">
                    <UserX size={11} /> Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="bg-[var(--bg2)] border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
            <Users size={11} /> Members ({memberList.length + 1})
          </h4>
          {isOwner && (
            <button onClick={loadRequests} className="text-[9px] font-black uppercase tracking-widest text-neutral-600 hover:text-neutral-300 transition-colors px-2 py-1 border border-neutral-800 rounded-lg">
              Check Requests
            </button>
          )}
        </div>
        <div className="space-y-2">
          {/* Owner */}
          <div className="flex items-center justify-between bg-[var(--bg0)] border border-neutral-800 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Crown size={12} className="text-amber-500" />
              <span className="text-sm font-bold text-neutral-200">
                {crew.ownerId === userId ? 'You (Owner)' : 'Crew Owner'}
              </span>
            </div>
          </div>
          {/* Other members */}
          {memberList.map(mid => (
            <div key={mid} className="flex items-center justify-between bg-[var(--bg0)] border border-neutral-800 rounded-xl px-3 py-2.5">
              <span className="text-sm text-neutral-300">{mid === userId ? 'You' : (memberNames[mid] || 'Member')}</span>
              {isOwner && (
                <button onClick={() => handleKick(mid)}
                  className="text-neutral-700 hover:text-red-500 transition-colors p-1">
                  <UserX size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CrewDashboard({ crew, characters, onBack, onUpdate, onTransferChar, userId }) {
  const [contentTab, setContentTab]                   = useState('claims');
  const [selectedNodeId, setSelectedNodeId]           = useState(null);
  const [showWardBoss, setShowWardBoss]               = useState(false);
  const [showShare, setShowShare]                     = useState(false);
  const [activeAbility, setActiveAbility]             = useState(null);
  const [activeUpgrade, setActiveUpgrade]             = useState(null);
  const [secondaryScoreCohort, setSecondaryScoreCohort] = useState(null);

  const template    = CREW_TEMPLATES[crew.templateId];
  const accentColor = template.color;
  const linkedChar  = characters.find(c => c.id === crew.characterId);
  const isB68       = linkedChar?.game === 'B68';
  const coinKey     = 'coin';
  const currName    = isB68 ? 'Stacks' : 'Coin';
  const charCoin    = linkedChar?.[coinKey] ?? 0;

  const enhancedClaims = template.claims.map(claim => {
    const state  = crew.claimsState[claim.id] || { status: 'locked', notes: '' };
    let   status = state.status;
    if (status === 'locked') {
      const forwardAdj  = claim.connections?.some(id => crew.claimsState[id]?.status === 'owned');
      const backwardAdj = template.claims.some(other =>
        crew.claimsState[other.id]?.status === 'owned' && other.connections?.includes(claim.id)
      );
      if (forwardAdj || backwardAdj) status = 'available';
    }
    return { ...claim, ...state, status };
  });

  const claimBenefits   = enhancedClaims.filter(c => c.status === 'owned');
  const upgradeBenefits = (crew.upgrades || []).filter(u => !u.startsWith('Cohort:'));

  const upgradeDescs = {};
  [...(template.specificUpgrades || [])].forEach(u => { upgradeDescs[u.name] = u.desc; });
  GENERAL_UPGRADES.forEach(cat => cat.items.forEach(item => {
    upgradeDescs[`${cat.category}: ${item.name}`] = item.desc;
  }));

  const updateClaimNode = (nodeId, updates) => {
    const newClaimsState = { ...crew.claimsState, [nodeId]: { ...(crew.claimsState[nodeId] || {}), ...updates } };
    const crewUpdates = { claimsState: newClaimsState };
    if (updates.status === 'owned') {
      const claimDef = template.claims.find(c => c.id === nodeId);
      if (claimDef && (nodeId.startsWith('turf') || claimDef.label.toLowerCase() === 'turf')) {
        crewUpdates.rep = Math.min(12, (crew.rep || 0) + 1);
      }
    }
    onUpdate(crewUpdates);
  };

  const addCohort = () => {
    onUpdate({ cohorts: [...crew.cohorts, {
      id: Date.now().toString(), name: 'New Cohort', type: 'Gang', subtype: '',
      edges: [], flaws: [], status: 'healthy', quality: (crew.tier || 0) + 1,
      downtimeAction: '', assignment: 'primary',
    }]});
  };

  const updateCohort = (id, updates) => onUpdate({ cohorts: crew.cohorts.map(c => c.id === id ? { ...c, ...updates } : c) });
  const deleteCohort = (id) => onUpdate({ cohorts: crew.cohorts.filter(c => c.id !== id) });

  const toggleUpgrade = (name) => {
    const has = crew.upgrades.includes(name);
    onUpdate({ upgrades: has ? crew.upgrades.filter(u => u !== name) : [...crew.upgrades, name] });
  };

  const transferStacks = (dir) => {
    if (dir === 'charToCrew' && charCoin >= 1) {
      onUpdate({ stacks: (crew.stacks || 0) + 1 });
      onTransferChar(linkedChar.id, { [coinKey]: charCoin - 1 });
    }
    if (dir === 'crewToChar' && (crew.stacks || 0) >= 1) {
      onUpdate({ stacks: crew.stacks - 1 });
      onTransferChar(linkedChar.id, { [coinKey]: charCoin + 1 });
    }
  };

  const CONTENT_TABS = [
    { id: 'claims',    label: 'Claims',    icon: <Target size={15} /> },
    { id: 'abilities', label: 'Abilities', icon: <Shield size={15} /> },
    { id: 'cohorts',   label: 'Cohorts',   icon: <Users size={15} /> },
    { id: 'upgrades',  label: 'Upgrades',  icon: <TrendingUp size={15} /> },
    { id: 'members',   label: 'Members',   icon: <UserPlus size={15} /> },
  ];

  const circleOrder = ['First Circle', 'Second Circle', 'Third Circle', 'Final Circle'];
  const activeCircle = crew.utopianCircle || 'First Circle';
  const filteredAbilities = template.circles
    ? template.abilities.filter(a => circleOrder.indexOf(a.circle) <= circleOrder.indexOf(activeCircle))
    : template.abilities;

  const STATS = [
    { label: 'Tier',   key: 'tier',   max: 5  },
    { label: 'Rep',    key: 'rep',    max: 12 },
    { label: 'Heat',   key: 'heat',   max: 9  },
    { label: 'Wanted', key: 'wanted', max: 4  },
  ];

  return (
    <div className="flex flex-col animate-fade-in" style={{ background: 'var(--bg0)', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

      {/* ── HEADER ── */}
      <div className="shrink-0 bg-[var(--bg2)] border-b border-neutral-800 shadow-md" style={{ borderTopColor: accentColor, borderTopWidth: 3 }}>

        {/* Row 1: Back + crew name */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-bold py-2 px-3 hover:bg-neutral-800 rounded-lg transition-colors shrink-0">
            <ArrowLeft size={15} /> Crews
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CrewIcon id={template.icon} size={18} color={accentColor} />
              <h2 className="font-black uppercase tracking-widest text-neutral-100 truncate text-sm">{crew.name}</h2>
            </div>
            <p className="text-[10px] text-neutral-600 uppercase font-black tracking-widest">
              {template.name}{linkedChar ? ` · ${linkedChar.name}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Share / Invite */}
            <button onClick={() => setShowShare(true)}
              className="p-3 border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 rounded-xl transition-colors">
              <Share2 size={18} />
            </button>
            {/* Ward Boss */}
            <button onClick={() => setShowWardBoss(true)}
              className={`p-3 border rounded-xl transition-colors ${(crew.wardBoss?.anger || 0) >= 4 ? 'border-amber-700 text-amber-400 animate-pulse bg-amber-950/20' : 'border-neutral-800 text-neutral-500 hover:text-amber-400 hover:border-amber-900'}`}>
              <Crown size={18} />
            </button>
          </div>
        </div>

        {/* Row 2: Stats — 4 equal large boxes */}
        <div className="grid grid-cols-4 gap-2 px-4 pb-3">
          {STATS.map(s => (
            <div key={s.key} className="flex flex-col bg-[var(--bg0)] border border-neutral-800 rounded-xl overflow-hidden">
              {/* Label */}
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 text-center pt-2 pb-1">{s.label}</span>
              {/* Big number */}
              <span className="font-black text-white text-2xl text-center leading-none pb-2">{crew[s.key] || 0}</span>
              {/* +/- row — full width, clearly separated */}
              <div className="grid grid-cols-2 border-t border-neutral-800">
                <button
                  onClick={() => onUpdate({ [s.key]: Math.max(0, (crew[s.key] || 0) - 1) })}
                  className="py-2.5 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 active:bg-neutral-700 transition-all border-r border-neutral-800">
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => onUpdate({ [s.key]: Math.min(s.max, (crew[s.key] || 0) + 1) })}
                  className="py-2.5 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 active:bg-neutral-700 transition-all">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Row 3: Stacks transfer — clear two-column layout */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-3">
          {/* Character stacks */}
          <div className="flex items-center justify-between bg-[var(--bg0)] border border-neutral-800 rounded-xl px-3 py-2">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block">{currName}</span>
              <span className="font-black text-white text-lg leading-none">{charCoin}</span>
            </div>
            <button
              onClick={() => transferStacks('charToCrew')}
              disabled={charCoin < 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
              style={{ background: accentColor + '20', color: accentColor, border: `1px solid ${accentColor}50` }}>
              Deposit <ChevronRight size={12} />
            </button>
          </div>
          {/* Crew vault */}
          <div className="flex items-center justify-between bg-[var(--bg0)] border border-neutral-800 rounded-xl px-3 py-2">
            <button
              onClick={() => transferStacks('crewToChar')}
              disabled={(crew.stacks || 0) < 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 border border-neutral-700 text-neutral-400 hover:border-neutral-500">
              <ChevronLeft size={12} /> Withdraw
            </button>
            <div className="text-right">
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block">Vault</span>
              <span className="font-black text-lg leading-none" style={{ color: accentColor }}>{crew.stacks || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div className="shrink-0 grid bg-[var(--bg2)] border-b border-neutral-800" style={{ gridTemplateColumns: `repeat(${CONTENT_TABS.length}, 1fr)` }}>
        {CONTENT_TABS.map(t => (
          <button key={t.id} onClick={() => setContentTab(t.id)}
            className="flex flex-col items-center gap-1 py-3 transition-all border-b-2"
            style={{
              borderBottomColor: contentTab === t.id ? accentColor : 'transparent',
              color: contentTab === t.id ? 'var(--text-bright)' : 'var(--text-dim)',
            }}>
            <span style={{ color: contentTab === t.id ? accentColor : 'var(--text-dim)' }}>{t.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto hide-scroll" style={{ background: 'var(--bg0)' }}>

        {/* CLAIMS TAB */}
        {contentTab === 'claims' && (
          <div className="flex flex-col h-full">
            <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-[var(--bg2)]">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: accentColor }}>
                  Claims Network · {template.name}
                </h3>
                <p className="text-[10px] text-neutral-600 mt-0.5">Claim adjacent nodes. ★ = special one-off.</p>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-2">
              <ClaimsGrid
                claims={enhancedClaims}
                onNodeSelect={setSelectedNodeId}
                selectedNodeId={selectedNodeId}
                accentColor={accentColor}
              />
            </div>
          </div>
        )}

        {/* ABILITIES TAB */}
        {contentTab === 'abilities' && (
          <div className="p-4 flex flex-col gap-3">
            {/* Utopian circle selector */}
            {template.circles && (
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block mb-2">Active Circle</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {template.circles.map(circle => (
                    <button key={circle} onClick={() => onUpdate({ utopianCircle: circle })}
                      className="text-[10px] font-black uppercase tracking-widest px-3 py-2.5 border rounded-xl transition-all"
                      style={activeCircle === circle
                        ? { borderColor: accentColor, background: accentColor + '20', color: accentColor }
                        : { borderColor: 'var(--border)', background: 'var(--bg2)', color: 'var(--text-muted)' }}>
                      {circle}
                    </button>
                  ))}
                </div>
                {template.circleRequirements?.[activeCircle] && (
                  <p className="text-[9px] text-neutral-600 mt-2 leading-snug italic px-1">{template.circleRequirements[activeCircle]}</p>
                )}
              </div>
            )}
            {template.circles && (
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block mb-1.5">Utopian Vision</span>
                <input value={crew.utopianVision || ''} onChange={e => onUpdate({ utopianVision: e.target.value })}
                  placeholder="Free · Egalitarian · Radiant..."
                  className="w-full border border-neutral-800 rounded-xl text-sm px-3 py-2.5 outline-none"
                  style={{ background: 'var(--bg0)', color: 'var(--text)', colorScheme: 'inherit' }} />
              </div>
            )}

            <CollapsibleSection title="Crew Abilities" icon={<Shield size={12} />} count={filteredAbilities.length} defaultOpen={true}>
              <div className="space-y-1.5">
                {filteredAbilities.map(ability => (
                  <div key={ability.name} className="border border-neutral-800/60 rounded-xl overflow-hidden">
                    <button onClick={() => setActiveAbility(activeAbility === ability.name ? null : ability.name)}
                      className="px-4 py-3.5 text-left w-full hover:bg-neutral-800/20 transition-colors flex justify-between items-center gap-3">
                      <div>
                        {ability.circle && (
                          <span className="block text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: accentColor + 'aa' }}>{ability.circle}</span>
                        )}
                        <span className="font-black text-sm uppercase tracking-wide text-neutral-200">{ability.name}</span>
                      </div>
                      {activeAbility === ability.name
                        ? <ChevronDown size={14} className="text-neutral-500 shrink-0" />
                        : <ChevronRight size={14} className="text-neutral-500 shrink-0" />}
                    </button>
                    {activeAbility === ability.name && (
                      <div className="px-4 pb-4 text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/40 pt-3">
                        {ability.desc}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <ActiveBenefitsChips
              claimBenefits={claimBenefits}
              upgradeBenefits={upgradeBenefits}
              upgradeDescs={upgradeDescs}
              accentColor={accentColor}
            />
          </div>
        )}

        {/* COHORTS TAB */}
        {contentTab === 'cohorts' && (
          <div className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                <Users size={13} /> Cohorts
              </h3>
              <button onClick={addCohort}
                className="flex items-center gap-1.5 text-xs font-black uppercase px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded-xl transition-colors">
                <PlusCircle size={13} /> Add Cohort
              </button>
            </div>

            {crew.cohorts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-600">
                <Users size={28} className="mb-3 opacity-20" />
                <p className="text-sm italic">No cohorts established.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {crew.cohorts.map(cohort => (
                  <div key={cohort.id} className="bg-[var(--bg2)] border border-neutral-800 rounded-2xl p-4 space-y-3">
                    {/* Name + delete */}
                    <div className="flex items-center gap-3">
                      <input value={cohort.name} onChange={e => updateCohort(cohort.id, { name: e.target.value })}
                        className="flex-1 bg-transparent font-black text-sm uppercase tracking-wide text-neutral-200 outline-none border-b border-neutral-800 focus:border-red-800 pb-1"
                        style={{ colorScheme: 'inherit' }} />
                      <button onClick={() => deleteCohort(cohort.id)} className="text-neutral-700 hover:text-red-500 transition-colors p-1.5">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Type + Subtype */}
                    <div className="grid grid-cols-2 gap-2">
                      <select value={cohort.type} onChange={e => updateCohort(cohort.id, { type: e.target.value, subtype: '' })}
                        className="border border-neutral-700 rounded-xl px-3 py-2.5 text-sm outline-none font-bold"
                        style={{ background: 'var(--bg3)', color: 'var(--text)', colorScheme: 'inherit' }}>
                        {COHORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {cohort.type === 'Gang' ? (
                        <select value={cohort.subtype} onChange={e => updateCohort(cohort.id, { subtype: e.target.value })}
                          className="border border-neutral-700 rounded-xl px-3 py-2.5 text-sm outline-none"
                          style={{ background: 'var(--bg3)', color: 'var(--text-dim)', colorScheme: 'inherit' }}>
                          <option value="">Type...</option>
                          {GANG_SUBTYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <input value={cohort.subtype} onChange={e => updateCohort(cohort.id, { subtype: e.target.value })}
                          placeholder="Specialty..."
                          className="border border-neutral-700 rounded-xl px-3 py-2.5 text-sm outline-none"
                          style={{ background: 'var(--bg3)', color: 'var(--text-dim)', colorScheme: 'inherit' }} />
                      )}
                    </div>

                    {/* Status + Quality */}
                    <div className="grid grid-cols-2 gap-2">
                      <select value={cohort.status} onChange={e => updateCohort(cohort.id, { status: e.target.value })}
                        className={`border rounded-xl px-3 py-2.5 text-sm outline-none font-bold ${STATUS_COLORS[cohort.status] || ''}`}
                        style={{ colorScheme: 'inherit' }}>
                        {COHORT_STATUSES.map(s => <option key={s} value={s} className="bg-neutral-900 text-neutral-200">{s}</option>)}
                      </select>
                      <div className="flex items-center justify-between bg-[var(--bg3)] border border-neutral-700 rounded-xl px-3 py-2">
                        <span className="text-[10px] font-black text-neutral-500 uppercase">Quality</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateCohort(cohort.id, { quality: Math.max(0, (cohort.quality || 1) - 1) })}
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 hover:text-white active:scale-95">
                            <Minus size={11} />
                          </button>
                          <span className="font-black text-white w-5 text-center">{cohort.quality || 1}</span>
                          <button onClick={() => updateCohort(cohort.id, { quality: Math.min(6, (cohort.quality || 1) + 1) })}
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 hover:text-white active:scale-95">
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Edges + Flaws */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-black text-neutral-600 block mb-2">Edges</span>
                        {COHORT_EDGES.map(e => (
                          <label key={e} className="flex items-center gap-2 cursor-pointer mb-1.5">
                            <div className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${cohort.edges.includes(e) ? 'bg-red-600 border-red-600' : 'border-neutral-700'}`} />
                            <span className="text-xs text-neutral-400">{e}</span>
                            <input type="checkbox" className="hidden" checked={cohort.edges.includes(e)}
                              onChange={() => updateCohort(cohort.id, { edges: cohort.edges.includes(e) ? cohort.edges.filter(x => x !== e) : [...cohort.edges, e] })} />
                          </label>
                        ))}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-neutral-600 block mb-2">Flaws</span>
                        {COHORT_FLAWS.map(f => (
                          <label key={f} className="flex items-center gap-2 cursor-pointer mb-1.5">
                            <div className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${cohort.flaws.includes(f) ? 'bg-red-600 border-red-600' : 'border-neutral-700'}`} />
                            <span className="text-xs text-neutral-400">{f}</span>
                            <input type="checkbox" className="hidden" checked={cohort.flaws.includes(f)}
                              onChange={() => updateCohort(cohort.id, { flaws: cohort.flaws.includes(f) ? cohort.flaws.filter(x => x !== f) : [...cohort.flaws, f] })} />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Downtime action */}
                    <div>
                      <span className="text-[10px] uppercase font-black text-neutral-600 block mb-1.5">Downtime Action</span>
                      <select value={cohort.downtimeAction || ''} onChange={e => updateCohort(cohort.id, { downtimeAction: e.target.value })}
                        className="w-full border border-neutral-700 rounded-xl px-3 py-2.5 text-sm outline-none"
                        style={{ background: 'var(--bg3)', color: 'var(--text-dim)', colorScheme: 'inherit' }}>
                        <option value="">— None assigned —</option>
                        <option value="assist">Assist a PC (+{cohort.quality || 1}d bonus)</option>
                        <option value="ltp">Long-Term Project (roll Quality)</option>
                        <option value="heat">Reduce Heat (roll Quality)</option>
                        <option value="recover">Recover (2 levels of harm)</option>
                      </select>
                    </div>

                    {/* Score assignment */}
                    <div>
                      <span className="text-[10px] uppercase font-black text-neutral-600 block mb-2">Score Assignment</span>
                      <div className="flex gap-3">
                        {['primary', 'secondary'].map(a => (
                          <label key={a} className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${cohort.assignment === a ? 'bg-red-600 border-red-600' : 'border-neutral-700'}`}>
                              {cohort.assignment === a && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className={`text-xs font-black uppercase ${cohort.assignment === a ? 'text-neutral-200' : 'text-neutral-600'}`}>{a}</span>
                            <input type="radio" className="hidden" checked={cohort.assignment === a} onChange={() => updateCohort(cohort.id, { assignment: a })} />
                          </label>
                        ))}
                      </div>
                      {cohort.assignment === 'secondary' && (
                        <button onClick={() => setSecondaryScoreCohort(cohort)}
                          className="mt-2.5 w-full flex items-center justify-center gap-2 py-3 border border-red-900/50 text-red-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-950/20 transition-colors active:scale-95">
                          <Dices size={13} /> Roll Secondary Score
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* UPGRADES TAB */}
        {contentTab === 'upgrades' && (
          <div className="p-4 flex flex-col gap-4">
            {/* Crew-specific */}
            <div>
              <h4 className="text-[10px] uppercase font-black text-neutral-500 mb-2 border-b border-neutral-800 pb-2">{template.name} Specific</h4>
              <div className="space-y-2">
                {template.specificUpgrades.map(upg => {
                  const owned = crew.upgrades.includes(upg.name);
                  return (
                    <div key={upg.name}>
                      <button onClick={() => { toggleUpgrade(upg.name); setActiveUpgrade(activeUpgrade === upg.name ? null : upg.name); }}
                        className="w-full px-4 py-3.5 border rounded-xl text-left flex justify-between items-center transition-all active:scale-[0.99]"
                        style={owned
                          ? { background: accentColor + '18', borderColor: accentColor + '60', color: accentColor }
                          : { background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        <span className="font-black text-sm uppercase tracking-wide">{upg.name}</span>
                        {owned && <CheckCircle size={16} />}
                      </button>
                      {activeUpgrade === upg.name && (
                        <div className="px-4 py-3 text-sm text-neutral-400 leading-relaxed bg-[var(--bg0)] border border-t-0 border-neutral-800 rounded-b-xl">
                          {upg.desc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* General upgrades */}
            {GENERAL_UPGRADES.map(cat => (
              <div key={cat.category}>
                <h4 className="text-[10px] uppercase font-black text-neutral-500 mb-2 border-b border-neutral-800 pb-2">{cat.category}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {cat.items.map(item => {
                    const key   = `${cat.category}: ${item.name}`;
                    const owned = crew.upgrades.includes(key);
                    return (
                      <div key={item.name}>
                        <button onClick={() => { toggleUpgrade(key); setActiveUpgrade(activeUpgrade === key ? null : key); }}
                          className="w-full px-3 py-3 border rounded-xl text-left flex justify-between items-center transition-all active:scale-[0.99]"
                          style={owned
                            ? { background: accentColor + '15', borderColor: accentColor + '50', color: accentColor }
                            : { background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                          <span className="font-bold text-xs uppercase tracking-wide">{item.name}</span>
                          {owned && <CheckCircle size={13} />}
                        </button>
                        {activeUpgrade === key && (
                          <div className="px-3 py-2.5 text-xs text-neutral-400 leading-relaxed bg-[var(--bg0)] border border-t-0 border-neutral-800 rounded-b-xl col-span-2">
                            {item.desc}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        {/* MEMBERS TAB */}
        {contentTab === 'members' && (
          <div className="p-4">
            <MembersPanel crew={crew} userId={userId} onUpdate={onUpdate} />
          </div>
        )}

      {/* Modals */}
      {selectedNodeId && (
        <NodeModal
          node={enhancedClaims.find(c => c.id === selectedNodeId)}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={u => { updateClaimNode(selectedNodeId, u); if (u.status !== undefined) setSelectedNodeId(null); }}
          accentColor={accentColor}
        />
      )}
      {showWardBoss && (
        <WardBossModal wardBoss={crew.wardBoss || {}} onUpdate={wb => onUpdate({ wardBoss: wb })} onClose={() => setShowWardBoss(false)} />
      )}
      {showShare && (
        <ShareCrewModal crew={crew} onClose={() => setShowShare(false)} />
      )}
      {secondaryScoreCohort && (
        <SecondaryScoreModal cohort={secondaryScoreCohort} onClose={() => setSecondaryScoreCohort(null)} />
      )}
    </div>
  );
}


// ─── CREW CREATION ────────────────────────────────────────────────────────────

function CrewCreation({ characters, onCreated, onCancel, preselectedCharId }) {
  const [name,     setName]     = useState('');
  const [template, setTemplate] = useState('HitSquad');
  const [charId,   setCharId]   = useState(preselectedCharId || '');
  const t = CREW_TEMPLATES[template];

  return (
    <div className="max-w-2xl mx-auto p-4 pb-28 animate-fade-in" style={{ background: 'var(--bg0)', minHeight: '100%' }}>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onCancel} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-bold p-1.5 hover:bg-neutral-800 rounded-lg">
          <ArrowLeft size={16} /> Crews
        </button>
        <h2 className="font-black uppercase tracking-widest text-neutral-200">New Crew</h2>
      </div>

      <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl p-5 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Assign to Character</label>
            <select value={charId} onChange={e => setCharId(e.target.value)}
              className="w-full border border-neutral-800 rounded-xl px-3 py-2.5 text-sm outline-none appearance-none"
              style={{ background: 'var(--bg0)', color: 'var(--text)', colorScheme: 'inherit' }}>
              <option value="">— Select Character —</option>
              {characters.map(c => <option key={c.id} value={c.id}>{c.name}{c.alias ? ` "${c.alias}"` : ''} · {c.playbook}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Crew Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. The Night Vipers"
              className="w-full border border-neutral-800 rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: 'var(--bg0)', color: 'var(--text)', colorScheme: 'inherit' }} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Crew Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(CREW_TEMPLATES).map(([id, ct]) => (
              <button key={id} onClick={() => setTemplate(id)}
                className={`p-3 border rounded-xl text-left transition-all`}
                style={template === id ? { borderColor: ct.color, background: ct.color + '15' } : { borderColor: 'var(--border)', background: 'var(--bg0)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <CrewIcon id={ct.icon} size={16} color={template === id ? ct.color : '#737373'} />
                  <span className="font-black text-xs uppercase tracking-wide" style={template === id ? { color: ct.color } : { color: '#737373' }}>{ct.name}</span>
                </div>
                <div className="text-[10px] text-neutral-600 leading-snug">{ct.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected crew details */}
        {t && (
          <div className="bg-[var(--bg0)] border rounded-xl p-4 space-y-3" style={{ borderColor: t.color + '40' }}>
            <div className="flex items-center gap-2">
              <CrewIcon id={t.icon} size={20} />
              <div>
                <h3 className="font-black uppercase tracking-widest text-sm" style={{ color: t.color }}>{t.name}</h3>
                <p className="text-[10px] text-neutral-500 italic">{t.tagline}</p>
              </div>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block mb-1">XP Trigger</span>
              <p className="text-[11px] text-neutral-400">{t.xpTrigger}</p>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block mb-1">Starting Upgrades</span>
              <div className="flex flex-wrap gap-1">
                {t.startingUpgrades.map(u => (
                  <span key={u} className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border" style={{ borderColor: t.color + '60', color: t.color, background: t.color + '10' }}>{u}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <button onClick={() => { if (!name.trim() || !charId) return; onCreated(defaultCrew(name.trim(), template, charId, null)); }}
          disabled={!name.trim() || !charId}
          className="w-full bg-neutral-200 text-black font-black uppercase tracking-widest py-3 rounded-xl hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          Establish Crew
        </button>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

const CrewManager = ({
  characters: charactersProp = [],
  setCharacters = () => {},
  preselectedCharId = null,
  userId = null,
}) => {
  const characters = charactersProp;

  const debounceTimer = useRef(null);
  const pendingUpdates = useRef({});

  const [crews, setCrews]           = useState([]);
  const [activeCrewId, setActiveCrewId] = useState(null);
  const [view, setView]             = useState('roster');
  const [loading, setLoading]       = useState(true);
  const [showJoin, setShowJoin]     = useState(false);

  // Load crews from api/client on mount
  useEffect(() => {
    const loadCrews = async () => {
      try {
        const records = await crewApi.list();
        setCrews(records);
      } catch (err) {
        console.error('Could not load crews:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCrews();
  }, []);

  const activeCrew = crews.find(c => c.id === activeCrewId);

  // Create new crew via api/client
  const handleCreated = async (crewTemplate) => {
    try {
      const payload = {
        name:           crewTemplate.name,
        templateId:     crewTemplate.templateId,
        characterId:    crewTemplate.characterId,
        tier:           crewTemplate.tier || 0,
        rep:            crewTemplate.rep || 0,
        heat:           crewTemplate.heat || 0,
        wanted:         crewTemplate.wanted || 0,
        stacks:         crewTemplate.stacks || 0,
        claimsState:    crewTemplate.claimsState || {},
        cohorts:        crewTemplate.cohorts || [],
        upgrades:       crewTemplate.upgrades || [],
        wardBoss:       crewTemplate.wardBoss || {},
        utopianCircle:  crewTemplate.utopianCircle || '',
        utopianVision:  crewTemplate.utopianVision || '',
        inviteCode:     crewTemplate.inviteCode || generateInviteCode(),
      };
      const record = await crewApi.create(payload);
      setCrews(prev => [...prev, record]);
      setActiveCrewId(record.id);
      setView('dashboard');
    } catch (err) {
      console.error('Failed to create crew:', err);
    }
  };

  // Update crew — debounced sync to api/client
  const handleUpdate = (updates) => {
    setCrews(prev => prev.map(c => c.id === activeCrewId ? { ...c, ...updates } : c));
    if (activeCrewId) {
      pendingUpdates.current = { ...pendingUpdates.current, ...updates };
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      const currentId = activeCrewId;
      debounceTimer.current = setTimeout(async () => {
        const payload = { ...pendingUpdates.current };
        pendingUpdates.current = {};
        try {
          await crewApi.update(currentId, payload);
        } catch (err) {
          console.error('Failed to sync crew:', err);
        }
      }, 750);
    }
  };

  const handleTransferChar = (charId, updates) => {
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, ...updates } : c));
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently disband this crew?')) return;
    try {
      await crewApi.remove(id);
      setCrews(prev => prev.filter(c => c.id !== id));
      if (activeCrewId === id) { setActiveCrewId(null); setView('roster'); }
    } catch (err) {
      console.error('Failed to delete crew:', err);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, []);

  const currentUserId = userId;
  const filteredCrews = crews.filter(c => {
    const isMember = (c.memberId || []).includes(currentUserId) || c.ownerId === currentUserId || c.userId === currentUserId;
    if (preselectedCharId) return isMember && c.characterId === preselectedCharId;
    return isMember;
  });

  if (view === 'dashboard' && activeCrew) {
    return <CrewDashboard crew={activeCrew} characters={characters} onBack={() => { setView('roster'); setActiveCrewId(null); }} onUpdate={handleUpdate} onTransferChar={handleTransferChar} userId={currentUserId} />;
  }
  if (view === 'create') {
    return <CrewCreation characters={characters} preselectedCharId={preselectedCharId} onCreated={handleCreated} onCancel={() => setView('roster')} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32" style={{ background: 'var(--bg0)', minHeight: '100%' }}>
        <div className="flex flex-col items-center gap-3 text-neutral-600">
          <div className="w-6 h-6 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
          <p className="text-xs uppercase font-black tracking-widest">Loading crews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in p-4 pb-28 max-w-5xl mx-auto" style={{ background: 'var(--bg0)', minHeight: '100%' }}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black uppercase tracking-widest text-neutral-200">{preselectedCharId ? 'Linked Crews' : 'Crews'}</h2>
        <button onClick={() => setView('create')} className="flex items-center gap-2 bg-neutral-200 text-black font-bold px-4 py-2 text-sm rounded-lg hover:bg-white transition-colors shadow-sm shrink-0">
          <PlusCircle size={15} /> New Crew
        </button>
      </div>

      {/* Join crew with code */}
      <button onClick={() => setShowJoin(true)}
        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-neutral-700 rounded-xl text-sm font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-300 hover:border-neutral-500 transition-colors">
        <UserPlus size={15} /> Join a Crew with Code
      </button>

      {showJoin && (
        <JoinCrewModal
          userId={currentUserId}
          characters={characters}
          onJoined={() => { setShowJoin(false); }}
          onClose={() => setShowJoin(false)}
        />
      )}

      {filteredCrews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-neutral-800/50 border-dashed rounded-2xl bg-[var(--bg2)]/50 text-neutral-600">
          <Users size={32} className="mb-3 opacity-20" />
          <p className="text-sm italic">No crews established yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCrews.map(crew => {
            const tmpl       = CREW_TEMPLATES[crew.templateId];
            const linkedChar = characters.find(c => c.id === crew.characterId);
            const ownedCount = Object.values(crew.claimsState || {}).filter(s => s.status === 'owned').length;
            const angerFull  = (crew.wardBoss?.anger || 0) >= 4;
            return (
              <div key={crew.id}
                className="bg-[var(--bg2)] border border-neutral-800 rounded-xl p-5 hover:border-neutral-600 transition-all group relative cursor-pointer overflow-hidden"
                style={{ borderTopColor: tmpl?.color, borderTopWidth: 3 }}
                onClick={() => { setActiveCrewId(crew.id); setView('dashboard'); }}>
                <button onClick={e => { e.stopPropagation(); handleDelete(crew.id); }}
                  className="absolute top-3 right-3 text-neutral-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                  <Trash2 size={14} />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <CrewIcon id={tmpl?.icon || 'swords'} size={18} />
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: tmpl?.color }}>{tmpl?.name}</div>
                    <h3 className="font-bold text-base text-white truncate pr-6">{crew.name}</h3>
                  </div>
                </div>
                {linkedChar && <p className="text-xs text-neutral-500 mb-3">↳ {linkedChar.name} · {linkedChar.playbook}</p>}
                <div className="flex items-center gap-3 pt-3 border-t border-neutral-800/50 text-[10px] font-black uppercase tracking-widest text-neutral-600 flex-wrap">
                  <span className="flex items-center gap-1"><DollarSign size={10} /> {crew.stacks || 0}</span>
                  <span className="flex items-center gap-1"><Crown size={10} className={angerFull ? 'text-amber-500' : ''} /> {ownedCount} claims</span>
                  <span>Tier {crew.tier || 0}</span>
                  {(crew.memberId || []).length > 0 && (
                    <span className="flex items-center gap-1 text-blue-500"><Users size={10} /> {(crew.memberId || []).length + 1}</span>
                  )}
                  {angerFull && <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={10} /> Angry</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CrewManager;