import React, { useRef, useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Input } from '@grafana/ui';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ width, height }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(50);

  useEffect(() => {
    if (!mountRef.current) return;

    // Three.js シーンのセットアップ
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // 平面グリッドのセットアップ
    const gridHelper = new THREE.GridHelper(30, 30);
    scene.add(gridHelper);

    // XYZ軸のセットアップ
    const axesHelper = new THREE.AxesHelper(15);
    scene.add(axesHelper);

    // キューブグループのセットアップ
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < 30; j++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = i - 15; // キューブの位置を調整
        cube.position.y = j - 15;
        group.add(cube);
      }
    }

    scene.add(group);
    camera.position.z = zoom;

    // OrbitControls のセットアップ
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 慣性効果を有効にする
    controls.dampingFactor = 0.25; // 慣性の速さ
    controls.enableZoom = false; // ズームを無効にする

    const renderScene = () => {
      renderer.render(scene, camera);
    };

    const animate = () => {
      requestAnimationFrame(animate);

      // 回転の部分をコメントアウトまたは削除
      // group.rotation.x += 0.01;
      // group.rotation.y += 0.01;

      camera.position.z = zoom;

      controls.update();

      renderScene();
    };

    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [width, height, zoom]);

  return (
    <div>
      <div ref={mountRef} style={{ width, height }} />
      <div style={{ marginTop: '10px' }}>
        <Input
          type="range"
          min="10"
          max="100"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.currentTarget.value))}
        />
      </div>
    </div>
  );
};
