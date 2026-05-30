// remove_black_background.gdshader
// Applied to player sprite whose texture has solid black (non-alpha) background.
// Uses hard edge cutoff to avoid the white/light halo that smoothstep creates.
shader_type canvas_item;

uniform float threshold : hint_range(0.0, 1.0) = 0.50;

void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	// Luminance-based detection
	float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
	// Hard step — no gradient means no semi-transparent halo/white border
	float alpha = step(threshold, lum);
	COLOR = vec4(tex.rgb, tex.a * alpha);
}
