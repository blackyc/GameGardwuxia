## Manages the player character sprite: sprite sheet slicing, animation setup, and transparent background.
## Uses luminance-based shader to remove black background + margin cropping to eliminate white edges.
class_name PlayerSpriteManager
extends AnimatedSprite2D

## Base texture path for the player sprite sheets.
const SPRITE_SHEET_PATH := "res://ailoadassets/"

## Margin to crop from each frame edge (removes white border artifacts).
const FRAME_MARGIN := 3

## Shader material for transparent background (removes black).
var _shader_material: ShaderMaterial

## Animation configuration data.
enum AnimType { IDLE, WALK, ATTACK }

## Frame configuration for each animation type.
var _anim_configs: Dictionary = {}

func _ready() -> void:
    _setup_shader()
    _setup_animations()
    print("[PlayerSprite] 初始化完成: shader=%s, frames=%s" % [material != null, sprite_frames != null])

## Create and apply the black-removal shader material.
func _setup_shader() -> void:
    var shader := Shader.new()
    shader.code = "
        // Remove black background by thresholding luminance
        shader_type canvas_item;
        render_mode blend_mix;

        uniform float threshold : source_color = 0.65;

        void fragment() {
            vec3 c = texture(TEXTURE, UV).rgb;
            float lum = dot(c, vec3(0.299, 0.587, 0.114));
            float alpha = step(threshold, lum);
            COLOR = vec4(c, alpha);
        }
    "
    _shader_material = ShaderMaterial.new()
    _shader_material.shader = shader
    _shader_material.set_shader_parameter("threshold", 0.65)
    material = _shader_material

## Configure all animations from sprite sheet textures.
func _setup_animations() -> void:
    _anim_configs = {
        AnimType.IDLE: {
            "texture_path": SPRITE_SHEET_PATH + "player_idle.png",
            "frames": 4,
            "columns": 4,
            "rows": 1,
            "frame_h": 64,
            "frame_w": 64,
            "speed": 6.0,
        },
        AnimType.WALK: {
            "texture_path": SPRITE_SHEET_PATH + "player_walk.png",
            "frames": 8,
            "columns": 8,
            "rows": 1,
            "frame_h": 64,
            "frame_w": 64,
            "speed": 10.0,
        },
        AnimType.ATTACK: {
            "texture_path": SPRITE_SHEET_PATH + "player_attack.png",
            "frames": 7,
            "columns": 7,
            "rows": 1,
            "frame_h": 64,
            "frame_w": 64,
            "speed": 12.0,
        },
    }

    for anim_type in _anim_configs:
        var config: Dictionary = _anim_configs[anim_type]
        var tex := load(config["texture_path"]) as Texture2D
        if tex == null:
            push_warning("PlayerSprite: Failed to load %s" % config["texture_path"])
            continue

        var frames := SpriteFrames.new()
        var anim_name := _get_animation_name(anim_type)
        frames.add_animation(anim_name)
        frames.set_animation_speed(anim_name, config["speed"])
        frames.set_animation_loop(anim_name, true)

        _slice_sprite_sheet(tex, config, frames, anim_name)
        sprite_frames = frames
        play(anim_name)
        break

## Slice a sprite sheet into frames with margin cropping to remove white edges.
func _slice_sprite_sheet(texture: Texture2D, config: Dictionary, frames: SpriteFrames, anim_name: String) -> void:
    var columns: int = config["columns"]
    var rows: int = config["rows"]
    var total_frames: int = config["frames"]
    var frame_w: int = config["frame_w"]
    var frame_h: int = config["frame_h"]

    # Effective frame size after margin crop (removes white border at edges)
    var crop_w: int = frame_w - FRAME_MARGIN * 2
    var crop_h: int = frame_h - FRAME_MARGIN * 2

    for frame_idx in range(total_frames):
        var col: int = frame_idx % columns
        var row: int = frame_idx / columns
        # Offset into the texture by margin to skip the white-border edge pixels
        var origin_x: int = col * frame_w + FRAME_MARGIN
        var origin_y: int = row * frame_h + FRAME_MARGIN
        var atlas_frame := _make_atlas_frame(texture, origin_x, origin_y, crop_w, crop_h)
        frames.add_frame(anim_name, atlas_frame, 1)

## Create an AtlasTexture from a cropped region of the source texture.
func _make_atlas_frame(source: Texture2D, x: int, y: int, w: int, h: int) -> AtlasTexture:
    var atlas := AtlasTexture.new()
    atlas.atlas = source
    atlas.region = Rect2i(x, y, w, h)
    return atlas

## Get the animation name string from the enum.
func _get_animation_name(anim_type: AnimType) -> String:
    match anim_type:
        AnimType.IDLE:
            return "idle"
        AnimType.WALK:
            return "walk"
        AnimType.ATTACK:
            return "attack"
        _:
            return "idle"
