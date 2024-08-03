import React, { useRef, useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import * as THREE from 'three';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Three.js シーンのセットアップ
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // キューブのセットアップ
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [width, height]);

  return <div ref={mountRef} style={{ width, height }} />;
};
