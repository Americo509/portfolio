"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { cameraLive, pushFrame, useCameraDebug } from "../debug";
import { TRACKS } from "./camera-track";

/**
 * Peças do ?debug dentro da cena: a trilha desenhada (posição em branco, alvo em
 * vermelho, quadros-chave como pontos), a câmera livre e a coleta de tempos de
 * quadro para o overlay de desempenho.
 */
export function DebugScene() {
  const showPath = useCameraDebug((s) => s.showPath);
  const free = useCameraDebug((s) => s.free);
  return (
    <>
      <PerfProbe />
      {showPath ? <TrackPath /> : null}
      {free ? <FreeCamera /> : null}
    </>
  );
}

function PerfProbe() {
  useFrame((_, delta) => pushFrame(delta * 1000));
  return null;
}

function TrackPath() {
  const portrait = useThree((s) => s.size.width / s.size.height < 0.8);
  const track = portrait ? TRACKS.mobile : TRACKS.desktop;
  const { posLine, lookLine, keys } = React.useMemo(() => {
    const line = (curve: THREE.CatmullRomCurve3, color: string) => {
      const g = new THREE.BufferGeometry().setFromPoints(curve.getSpacedPoints(600));
      return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9, depthTest: false }));
    };
    const pts = new THREE.BufferGeometry().setFromPoints(track.keys.map((k) => new THREE.Vector3(...k.pos)));
    return {
      posLine: line(track.pos, "#ffffff"),
      lookLine: line(track.look, "#e61919"),
      keys: new THREE.Points(pts, new THREE.PointsMaterial({ color: "#ffd166", size: 8, sizeAttenuation: false, depthTest: false }))
    };
  }, [track]);
  React.useEffect(
    () => () => {
      for (const o of [posLine, lookLine, keys]) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    },
    [posLine, lookLine, keys]
  );
  return (
    <group renderOrder={10}>
      <primitive object={posLine} />
      <primitive object={lookLine} />
      <primitive object={keys} />
    </group>
  );
}

/** Órbita a partir de onde a câmera está; o alvo da órbita vira o "alvo" do quadro capturado. */
function FreeCamera() {
  const controls = React.useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const target = React.useMemo(() => new THREE.Vector3(...cameraLive.look), []);
  useFrame(() => {
    const c = controls.current;
    if (c) cameraLive.look = c.target.toArray() as [number, number, number];
  });
  return <OrbitControls ref={controls} target={target} enableDamping={false} />;
}
