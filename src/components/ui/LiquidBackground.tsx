"use client"

import { useEffect, useRef, useCallback } from "react"
import { Renderer, Triangle, Program, Mesh, Color } from "ogl"

export default function LiquidBackground({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animateId = useRef<number | null>(null)
  const meshRef = useRef<Mesh | null>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 }) // Normalized mouse position (0-1)
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 })

  const vert = `
    attribute vec2 uv;
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0, 1);
    }
  `

  const frag = `
    precision highp float;
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uResolution;
    uniform vec2 uMouse; // Mouse position uniform
    varying vec2 vUv;
    
    void main() {
      float mr = min(uResolution.x, uResolution.y);
      vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
      
      // Calculate distance from mouse (normalized coordinates)
      vec2 mouseUv = (uMouse * 2.0 - 1.0) * uResolution.xy / mr;
      float distToMouse = length(uv - mouseUv);
      
      // Use mouse influence instead of just time
      float mouseInfluence = 1.0 / (1.0 + distToMouse * 2.0); // Falloff based on distance
      float d = -uTime * 0.3 + distToMouse * 0.5; // Reduced time influence
      float a = 0.0;
      
      for (float i = 0.0; i < 8.0; ++i) {
        // Make the animation respond more to mouse proximity
        a += cos(i - d - a * uv.x) * (0.5 + mouseInfluence * 0.5);
        d += sin(uv.y * i + a) * (0.5 + mouseInfluence * 0.5);
      }
      
      d += uTime * 0.2; // Reduced base animation speed
      
      // Define three colors for smooth transitions
      vec3 deepBlue = vec3(0.51, 0.67, 0.92);     // Original light blue #82abeb
      vec3 darkBlue = vec3(0.043, 0.161, 0.271);  // #0b2945 - transition color
      vec3 purple = vec3(0.61, 0.29, 0.4);        // Original purple #9c4a66
      
      // Make waves respond to mouse position
      float wave1 = cos(uv.x * 1.2 + d * 0.3 + mouseInfluence * 2.0) * 0.5 + 0.5;
      float wave2 = sin(length(uv) * 1.8 + d * 0.2 + mouseInfluence * 1.5) * 0.5 + 0.5;
      
      // Create two blend factors for three-color mixing
      float blendFactor1 = mix(wave1, wave2, 0.3 + mouseInfluence * 0.1);
      float blendFactor2 = sin(d * 0.5 + length(uv) * 0.8) * 0.5 + 0.5;
      
      // Smooth the transitions
      blendFactor1 = smoothstep(0.2, 0.8, blendFactor1);
      blendFactor2 = smoothstep(0.3, 0.7, blendFactor2);
      
      // Three-way color mixing
      vec3 finalCol;
      if (blendFactor1 < 0.5) {
        // Transition from deep blue to dark blue
        finalCol = mix(deepBlue, darkBlue, blendFactor1 * 2.0);
      } else {
        // Transition from dark blue to purple
        finalCol = mix(darkBlue, purple, (blendFactor1 - 0.5) * 2.0);
      }
      
      // Add secondary blending for more complexity
      vec3 secondaryMix = mix(darkBlue, mix(deepBlue, purple, 0.5), blendFactor2);
      finalCol = mix(finalCol, secondaryMix, 0.3);
      
      // Add mouse-influenced variation
      finalCol += sin(vec3(d, a, d + a)) * (0.02 + mouseInfluence * 0.03);
      
      gl_FragColor = vec4(finalCol, 1.0);
    }
  `

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    // Normalize mouse position to 0-1 range
    targetMouseRef.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: 1.0 - (event.clientY - rect.top) / rect.height // Flip Y to match WebGL coordinates
    }
  }, [])

  const resize = () => {
    const container = containerRef.current
    const renderer = rendererRef.current
    const mesh = meshRef.current

    if (!container || !renderer || !mesh) return
    
    const width = container.offsetWidth
    const height = container.offsetHeight
    
    renderer.setSize(width, height)
    
    const canvas = renderer.gl.canvas
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    
    mesh.program.uniforms.uResolution.value = [
      width,
      height,
      width / height,
    ]
  }

  const update = (t: number) => {
    animateId.current = requestAnimationFrame(update)
    const mesh = meshRef.current
    const renderer = rendererRef.current
    
    if (mesh && renderer) {
      // Smoothly interpolate mouse position for fluid movement
      const lerpFactor = 0.05 // Adjust this for responsiveness (0.01 = slow, 0.1 = fast)
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * lerpFactor
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * lerpFactor
      
      mesh.program.uniforms.uTime.value = t * 0.001
      mesh.program.uniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y]
      renderer.render({ scene: mesh })
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: Math.min(window.devicePixelRatio, 2)
    })
    rendererRef.current = renderer
    const gl = renderer.gl
    gl.clearColor(0.176, 0.353, 0.627, 1)

    const canvas = gl.canvas
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.zIndex = '-10'

    container.appendChild(canvas)
    
    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", handleMouseMove) // Add mouse tracking

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(0.3, 0.2, 0.5) },
        uMouse: { value: [0.5, 0.5] }, // Add mouse uniform
        uResolution: {
          value: [window.innerWidth, window.innerHeight, window.innerWidth / window.innerHeight],
        },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })
    meshRef.current = mesh

    animateId.current = requestAnimationFrame(update)

    return () => {
      if (animateId.current) {
        cancelAnimationFrame(animateId.current)
      }
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove) // Clean up mouse listener
      if (container.contains(canvas)) {
        container.removeChild(canvas)
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [handleMouseMove])

  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 w-screen h-screen -z-10 ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -10
      }}
    />
  )
}