import React, { useRef, useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Input } from '@grafana/ui';

interface Props extends PanelProps<SimpleOptions> {}

export const MainPanel: React.FC<Props> = ({ width, height }) => {
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

    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = i; // キューブの位置を調整
        cube.position.y = j;
        group.add(cube);
      }
    }

    scene.add(group);

    // 虹色の棒グラフのセットアップ
    const barGroup = new THREE.Group();
    const barGeometry = new THREE.BoxGeometry(1, 1, 1);
    const rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];

    for (let i = 0; i < 7; i++) {
      const barMaterial = new THREE.MeshBasicMaterial({ color: rainbowColors[i] });
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.x = i * 2 - 7;
      bar.position.y = 15;
      bar.scale.y = Math.random() * 5 + 1; // ランダムな高さで初期化
      barGroup.add(bar);
    }

    barGroup.position.set(0, 0, 5);
    scene.add(barGroup);

    // 折れ線グラフのセットアップ
    const lineGroup = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    for (let k = 0; k < 5; k++) {
      const points = [];
      for (let i = 0; i < 10; i++) {
        points.push(new THREE.Vector3(i * 2 - 9, Math.random() * 10 - 5, 0));
      }
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.position.y = -15 + k * 5;
      lineGroup.add(line);
    }

    lineGroup.position.set(0, 0, 5);
    scene.add(lineGroup);

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

      // 虹色の棒グラフのアニメーション
      barGroup.children.forEach((bar, index) => {
        bar.scale.y = Math.sin(Date.now() * 0.001 + index) * 2 + 3; // サイン波で高さを変更
      });

      // 折れ線グラフのアニメーション
      lineGroup.children.forEach((line, index) => {
        const lineGeometry = line.geometry as THREE.BufferGeometry;
        const linePositions = lineGeometry.attributes.position.array as Float32Array;
        for (let i = 1; i < linePositions.length / 3; i++) {
          linePositions[i * 3 + 1] = Math.sin(Date.now() * 0.001 + i + index) * 5; // サイン波でY座標を変更
        }
        lineGeometry.attributes.position.needsUpdate = true;
      });

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
