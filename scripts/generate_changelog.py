from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from enum import Enum
from textwrap import dedent


@dataclass
class Change:
    type: str
    text: str


@dataclass
class Version:
    date: str | None = None
    title: str | None = None
    notes: str | None = None
    changes: list[Change] = None


@dataclass
class Changelog:
    versions: dict[str, Version]


class ChangeType(Enum):
    FEATURE = "✨️"
    BUGFIX = "🐛"
    PERFORMANCE = "🚤"
    SECURITY = "🔒️"
    DOCS = "📚️"
    REFACTORING = "🧹"
    TEST = "🧪"
    BUILD = "🏗️"
    CLEANUP = "🗑️"
    OTHER = "🔹"

    @staticmethod
    def from_json(value: str) -> ChangeType | None:
        for change_type in ChangeType:
            if change_type.name.lower() == value:
                return change_type

        return None


class ChangelogGenerator:
    def generate_markdown_from_json(self, json_input_file: str, markdown_output_file: str, only_version: str | None) -> None:
        with open(json_input_file, "r", encoding="utf-8") as file:
            json_data = json.load(file)

        changelog = self._parse_changelog(json_data)

        if only_version is not None:
            if only_version not in changelog.versions:
                print(f"Version {only_version} does not exist.", file=sys.stderr)
                sys.exit(1)

        md = []

        if only_version is None:
            md.append(
                dedent("""
                    Changelog
                    ==========
                    
                    > [!IMPORTANT]
                    > This file is generated automatically from `changelog.json`.
                    > **Do not edit manually.**
                      
                    <style>
                      article h2 { border-top: 2px solid rgba(255, 255, 255, .15); padding-top: 1.5rem; margin-top: 1.5rem; }
                      article h3 { font-size: 1.25rem }
                    </style>
                """).strip()
            )

        for version_number, version in changelog.versions.items():
            if only_version is not None:
                if version_number != only_version:
                    continue
                else:
                    md.append(f"{version_number}: {self._strip_inline_markdown(version.title)}")

            if version_number == "UNRELEASED":
                if version.date:
                    print("Unreleased version must not have a date.", file=sys.stderr)
                    sys.exit(1)

                md.append("")
                md.append("## 🛠️ _(Unreleased)_")
                self._append_notes(md, version.notes)
                self._append_changes(md, version.changes)
            else:
                if not version.date:
                    print(f"Released version {version_number} must have a date.", file=sys.stderr)
                    sys.exit(1)

                icon = " 📦️" if only_version is None else ""

                md.append("")
                md.append(f"##{icon} **{version_number}** · {version.title} · _{version.date}_")
                self._append_notes(md, version.notes)
                self._append_changes(md, version.changes)

        if markdown_output_file != "-":
            out_ctx = open(markdown_output_file, "w", encoding="utf-8")
        else:
            out_ctx = sys.stdout

        with out_ctx as out:
            out.write("\n".join(md) + "\n")

    @staticmethod
    def _strip_inline_markdown(text: str) -> str:
        text = re.sub(r"(\*\*|__)(.*?)\1", r"\2", text)  # bold **text** or __text__
        text = re.sub(r"([*_])(.*?)\1", r"\2", text)  # italic *text* or _text_
        text = re.sub(r"`([^`]+)`", r"\1", text)  # inline code `text`
        return text

    @staticmethod
    def _parse_changelog(json_data) -> Changelog:
        versions = {}
        for k, v in json_data["versions"].items():
            changes = [Change(**c) for c in v.get("changes", [])]
            versions[k] = Version(
                date=v.get("date"),
                title=v.get("title"),
                notes=v.get("notes"),
                changes=changes
            )

        return Changelog(versions=versions)

    @staticmethod
    def _append_notes(md: list[str], notes: str | None):
        if notes:
            md.append("")
            md.append(notes)

    @staticmethod
    def _append_changes(md: list[str], changes: list[Change]):
        md.append("")
        md.append("### Changes")

        if changes:
            for c in changes:
                change_type = ChangeType.from_json(c.type)
                if change_type is None:
                    print(f"Unknown change type '{c.type}'.", file=sys.stderr)
                    sys.exit(1)

                md.append(f"- {change_type.value} {c.text}")
        else:
            md.append("_(no changes)_")


def main():
    parser = argparse.ArgumentParser(
        description="Generates changelogs for tH-Wiki in Markdown format using a JSON file."
    )
    parser.add_argument("json_input",
                        help="JSON input file (must fit to the changelog.schema.json schema)")
    parser.add_argument("markdown_output",
                        nargs="?",
                        default="-",
                        help="Markdown file to be written. Omit or use '-' to print to stdout instead.")
    parser.add_argument("--version",
                        required=False,
                        help="Process only a particular version. "
                             "Used to generate changelog for a release (with a title line and a blank line up front).",
                        metavar="x.y.z")
    args = parser.parse_args()

    generator = ChangelogGenerator()
    generator.generate_markdown_from_json(args.json_input, args.markdown_output, args.version)


if __name__ == "__main__":
    main()
