import React, { useRef, useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2,Slider } from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';
import * as THREE from 'three';

interface Props extends PanelProps<SimpleOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
};

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const styles = useStyles2(getStyles);

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  const mountRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = 30;
  useEffect(() => {
    if (!mountRef.current) return;
// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
mountRef.current.appendChild(renderer.domElement);

// Create a simple grid of boxes (mesh field)
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

for (let x = -10; x <= 10; x++) {
  for (let y = -10; y <= 10; y++) {
    const mesh1 = new THREE.Mesh(geometry, material);
    const mesh2 = new THREE.Mesh(geometry, material);
    mesh1.position.set(x, y, 0);
    scene.add(mesh1);
    mesh2.position.set(x, y, 10);
    scene.add(mesh2);
  }
}

camera.position.z = 30;
camera.position.z = zoomRef;
console.log(zoomRef);

const animate = () => {
  requestAnimationFrame(animate);
  scene.rotation.x += 0.01;
  scene.rotation.y += 0.01;
  renderer.render(scene, camera);
};
animate();

return () => {
  mountRef.current?.removeChild(renderer.domElement);
};
}, [width, height]);

if (data.series.length === 0) {
return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
}

  return (
    <div>
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
      ref={mountRef}
    >
    </div>
    <div
  style={{
    height: '300px',
    width: '300px'
  }}
>
  <Slider
    included
    max={100}
    min={0}
    orientation="horizontal"
    value={zoomRef}
  />
</div>
    </div>
  );
};
