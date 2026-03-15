import sys
import os
from PIL import Image

def clip_sprite_sheet(input_path, output_dir, frame_width, frame_height, names):
    """
    Clips a sprite sheet into individual frames.
    :param input_path: Path to the sprite sheet image.
    :param output_dir: Where to save the frames.
    :param frame_width: Width of each frame in pixels.
    :param frame_height: Height of each frame in pixels.
    :param names: List of names for the frames (e.g., ['idle', 'walk1', 'walk2', 'jump']).
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        sheet = Image.open(input_path)
        sheet_width, sheet_height = sheet.size

        cols = sheet_width // frame_width
        rows = sheet_height // frame_height

        count = 0
        for r in range(rows):
            for c in range(cols):
                if count >= len(names):
                    break
                
                left = c * frame_width
                top = r * frame_height
                right = left + frame_width
                bottom = top + frame_height

                frame = sheet.crop((left, top, right, bottom))
                
                # If frame is transparent/empty, skip it (optional)
                if not frame.getbbox():
                    continue

                output_path = os.path.join(output_dir, f"{names[count]}.png")
                frame.save(output_path)
                print(f"Saved: {output_path}")
                count += 1

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Example usage: 
    # python scripts/sprite_clipper.py assets/chicken_sheet.png public/assets/images/chicken 32 32 idle walk1 walk2 jump
    if len(sys.argv) < 6:
        print("Usage: python scripts/sprite_clipper.py <input_sheet> <output_dir> <width> <height> <name1> <name2> ...")
        sys.exit(1)

    input_sheet = sys.argv[1]
    output_dir = sys.argv[2]
    width = int(sys.argv[3])
    height = int(sys.argv[4])
    names = sys.argv[5:]

    clip_sprite_sheet(input_sheet, output_dir, width, height, names)
