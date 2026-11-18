import React from 'react';
import {interpolate} from 'remotion';
import {A} from '../anim/Art';

// Front-facing restaurant chef (bust), drawn in SVG.
//  mood  -1 = angry/frustrated … 1 = happy
//  talk  0..1 mouth opening
//  arms  0 = down, 1 = both hands raised (exasperated)
//  thumb 0..1 right hand thumbs-up
const SKIN = '#D9976B';
const SKIN_D = '#B97A52';
const HAIR = '#3A2618';

const Arm = ({sx, sy, a1, a2, side, thumb = 0}: {sx: number; sy: number; a1: number; a2: number; side: 1 | -1; thumb?: number}) => {
  const r = (d: number) => (d * Math.PI) / 180;
  const ex = sx + Math.cos(r(a1)) * 165;
  const ey = sy + Math.sin(r(a1)) * 165;
  const hx = ex + Math.cos(r(a2)) * 145;
  const hy = ey + Math.sin(r(a2)) * 145;
  return (
    <g>
      <path d={`M${sx} ${sy} L${ex} ${ey} L${hx} ${hy}`} fill="none" stroke="#D8D8D8" strokeWidth="74" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${sx} ${sy} L${ex} ${ey} L${hx} ${hy}`} fill="none" stroke="#FFFFFF" strokeWidth="64" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hx} cy={hy} r="36" fill={SKIN} stroke={SKIN_D} strokeWidth="4" />
      {/* fingers / thumb */}
      {thumb > 0.05 ? (
        <rect x={hx - 11} y={hy - 36 - 40 * thumb} width="22" height={44 * thumb} rx="11" fill={SKIN} stroke={SKIN_D} strokeWidth="4" />
      ) : (
        [-1, 0, 1].map((k) => <circle key={k} cx={hx + Math.cos(r(a2)) * 30 + k * 12 * -Math.sin(r(a2))} cy={hy + Math.sin(r(a2)) * 30 + k * 12 * Math.cos(r(a2))} r="12" fill={SKIN} stroke={SKIN_D} strokeWidth="3" />)
      )}
      {side ? null : null}
    </g>
  );
};

export const Chef = ({w, mood, talk, arms, thumb = 0, shake = 0}: {w: number; mood: number; talk: number; arms: number; thumb?: number; shake?: number}) => {
  const happy = Math.max(0, mood);
  const angry = Math.max(0, -mood);
  // brows: inner ends drop when angry, arch up when happy
  const browIn = 292 + angry * 22 - happy * 10;
  const browOut = 282 - angry * 6 - happy * 14;
  const eyeRy = 26 - happy * 14;
  // arm angles (degrees, 0 = right, 90 = down)
  const lA1 = interpolate(arms, [0, 1], [105, 215]);
  const lA2 = interpolate(arms, [0, 1], [95, 250]);
  const rA1 = interpolate(arms, [0, 1], [75, -35]) - thumb * 30;
  const rA2 = interpolate(arms, [0, 1], [85, -70]) - thumb * 190;
  return (
    <svg width={w} height={w * (760 / 600)} viewBox="0 0 600 760" style={{overflow: 'visible'}}>
      <g transform={`rotate(${shake} 300 500)`}>
        {/* body */}
        <path d="M70 780 L95 570 Q115 485 215 468 L385 468 Q485 485 505 570 L530 780 Z" fill="#FFFFFF" stroke="#D8D8D8" strokeWidth="6" />
        {[560, 625, 690].map((y) => (
          <React.Fragment key={y}>
            <circle cx="250" cy={y} r="9" fill="#CFCFCF" />
            <circle cx="350" cy={y} r="9" fill="#CFCFCF" />
          </React.Fragment>
        ))}
        {/* neck + scarf */}
        <rect x="258" y="420" width="84" height="60" fill={SKIN_D} />
        <path d="M228 462 L372 462 L300 540 Z" fill={A.red} />
        <circle cx="300" cy="470" r="18" fill={A.deep} />
        {/* arms */}
        <Arm sx={130} sy={530} a1={lA1} a2={lA2} side={-1} />
        <Arm sx={470} sy={530} a1={rA1} a2={rA2} side={1} thumb={thumb} />
        {/* ears + head */}
        <circle cx="178" cy="345" r="28" fill={SKIN_D} />
        <circle cx="422" cy="345" r="28" fill={SKIN_D} />
        <ellipse cx="300" cy="330" rx="125" ry="140" fill={SKIN} />
        {/* sideburns */}
        <path d="M180 260 Q178 320 190 345 L200 345 Q195 300 205 262 Z" fill={HAIR} />
        <path d="M420 260 Q422 320 410 345 L400 345 Q405 300 395 262 Z" fill={HAIR} />
        {/* toque */}
        <rect x="182" y="178" width="236" height="62" rx="12" fill="#FFFFFF" stroke="#D8D8D8" strokeWidth="5" />
        <circle cx="222" cy="140" r="68" fill="#FFFFFF" stroke="#D8D8D8" strokeWidth="5" />
        <circle cx="378" cy="140" r="68" fill="#FFFFFF" stroke="#D8D8D8" strokeWidth="5" />
        <circle cx="300" cy="108" r="86" fill="#FFFFFF" stroke="#D8D8D8" strokeWidth="5" />
        <rect x="186" y="182" width="228" height="40" fill="#FFFFFF" />
        {/* eyes */}
        {[250, 350].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="322" rx="22" ry={eyeRy} fill="#FFFFFF" />
            <circle cx={x + (angry > 0 ? 0 : 2)} cy={322 + happy * 2} r={Math.min(12, eyeRy - 2)} fill="#1E1410" />
          </g>
        ))}
        {/* brows */}
        <path d={`M212 ${browOut} Q245 ${browOut - 10 + angry * 10} 276 ${browIn}`} stroke={HAIR} strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d={`M388 ${browOut} Q355 ${browOut - 10 + angry * 10} 324 ${browIn}`} stroke={HAIR} strokeWidth="13" strokeLinecap="round" fill="none" />
        {/* nose */}
        <ellipse cx="300" cy="368" rx="24" ry="20" fill={SKIN_D} />
        {/* cheeks */}
        <circle cx="222" cy="380" r="22" fill="#E86A5A" opacity={0.15 + happy * 0.35 + angry * 0.2} />
        <circle cx="378" cy="380" r="22" fill="#E86A5A" opacity={0.15 + happy * 0.35 + angry * 0.2} />
        {/* mouth */}
        {happy > 0.3 ? (
          <path d={`M262 418 Q300 ${452 + talk * 22} 338 418 Z`} fill="#5A1A14" stroke="#3A100C" strokeWidth="4" />
        ) : (
          <ellipse cx="300" cy={426 + angry * 4} rx={26 - talk * 4} ry={5 + talk * 20} fill="#5A1A14" />
        )}
        {/* moustache */}
        <path d="M300 398 Q270 384 236 396 Q246 416 270 410 Q290 406 300 402 Q310 406 330 410 Q354 416 364 396 Q330 384 300 398 Z" fill={HAIR} />
      </g>
    </svg>
  );
};
