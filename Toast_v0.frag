uniform float u_time;
uniform vec3 u_colorBase;
uniform vec3 u_colorHighlight;
uniform float u_noiseScale;
varying vec2 vUv;

// 亂數與雜訊演算法
float random (vec2 st) { 
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); 
}

float noise (in vec2 st) {
    vec2 i = floor(st); 
    vec2 f = fract(st);
    float a = random(i); 
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0)); 
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = vUv;
    
    // 週期進度條 (商品的生命週期)
    float cycle = mod(u_time * 0.15, 1.0); 
    
    // 生成物質紋理
    float n = noise(uv * u_noiseScale + u_time * 0.1);
    vec3 materialColor = mix(u_colorBase, u_colorHighlight, n);
    
    // 實體與灰燼的邊界運算 (Entropy Mask)
    float mask = noise(uv * 5.0 - u_time * 0.2);
    float isSolid = step(cycle, mask); 
    
    // 灰燼狀態定義 (Residual Ash) - 避免時間變數過大導致浮點數溢位
    vec3 ashColor = vec3(0.15, 0.12, 0.1) * random(uv * 100.0 + mod(u_time, 100.0));
    float ashAlpha = 0.25 * noise(uv * 20.0);
    
    // 混合色彩與透明度
    vec3 finalColor = mix(ashColor, materialColor, isSolid);
    float finalAlpha = mix(ashAlpha, 1.0, isSolid);

    // 崩解邊緣的能量光暈 (Glitch / Glow)
    float edge = smoothstep(cycle - 0.05, cycle + 0.05, mask) - smoothstep(cycle + 0.05, cycle + 0.15, mask);
    finalColor += u_colorHighlight * edge * 1.5;

    gl_FragColor = vec4(finalColor, finalAlpha);
}