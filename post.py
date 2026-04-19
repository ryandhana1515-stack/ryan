"""
CLI tool to post content to TikTok, Instagram, and Facebook.

Usage examples:
  # Post a photo to all platforms
  python post.py photo path/to/image.png "My caption here" --url https://your-host.com/image.png

  # Post a video to all platforms
  python post.py video path/to/video.mp4 "My caption here" --url https://your-host.com/video.mp4

  # Generate image with nano_banana then post
  python post.py generate-and-post "a sunset over the ocean" "Beautiful sunset!" --url https://your-host.com/image.png

  # Post to specific platforms only
  python post.py photo image.png "Caption" --url https://host.com/img.png --platforms instagram facebook
"""

import argparse
import sys
from pathlib import Path
from social_poster import post_photo_to_all, post_video_to_all


def cmd_photo(args):
    if not Path(args.file).exists():
        print(f"Error: file not found: {args.file}")
        sys.exit(1)
    if not args.url:
        print("Error: --url is required for photo posts (Instagram needs a public URL).")
        print("Upload your image to a host (e.g. Imgur, Cloudinary, S3) and pass the URL with --url.")
        sys.exit(1)
    results = post_photo_to_all(args.file, args.caption, args.url)
    _print_summary(results)


def cmd_video(args):
    if not Path(args.file).exists():
        print(f"Error: file not found: {args.file}")
        sys.exit(1)
    results = post_video_to_all(args.file, args.caption, video_url=args.url or "")
    _print_summary(results)


def cmd_generate_and_post(args):
    from nano_banana import generate_image
    output_path = "output/post_image.png"
    print(f"Generating image: {args.prompt}")
    generate_image(args.prompt, output_path=output_path)
    if not args.url:
        print("\nImage generated. Upload it to a public host and re-run with --url to post to Instagram.")
        print(f"File saved at: {output_path}")
        print("Then run:")
        print(f'  python post.py photo {output_path} "{args.caption}" --url <public-url>')
        sys.exit(0)
    results = post_photo_to_all(output_path, args.caption, args.url)
    _print_summary(results)


def _print_summary(results: dict):
    print("\n--- POST SUMMARY ---")
    for platform, result in results.items():
        status = "OK" if result["success"] else "FAILED"
        detail = result.get("id") or result.get("error") or ""
        print(f"  {platform.upper():12} {status}  {detail}")
    print("--------------------")


def main():
    parser = argparse.ArgumentParser(description="Post to TikTok, Instagram, and Facebook")
    sub = parser.add_subparsers(dest="command", required=True)

    # photo subcommand
    p_photo = sub.add_parser("photo", help="Post a photo/image")
    p_photo.add_argument("file", help="Local image file path")
    p_photo.add_argument("caption", help="Post caption")
    p_photo.add_argument("--url", help="Public URL of the image (required for Instagram)")
    p_photo.set_defaults(func=cmd_photo)

    # video subcommand
    p_video = sub.add_parser("video", help="Post a video")
    p_video.add_argument("file", help="Local video file path")
    p_video.add_argument("caption", help="Post caption")
    p_video.add_argument("--url", default="", help="Public URL of the video (required for Instagram Reels)")
    p_video.set_defaults(func=cmd_video)

    # generate-and-post subcommand
    p_gen = sub.add_parser("generate-and-post", help="Generate an AI image then post it")
    p_gen.add_argument("prompt", help="Image generation prompt")
    p_gen.add_argument("caption", help="Post caption")
    p_gen.add_argument("--url", default="", help="Public URL where you'll host the generated image")
    p_gen.set_defaults(func=cmd_generate_and_post)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
