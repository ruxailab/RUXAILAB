# Copyright 2023 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Path pattern matching utilities."""

from enum import Enum
import re


def path_parts(path: str) -> list[str]:
    if not path or path == "" or path == "/":
        return []
    return path.strip("/").split("/")


def join_path(base: str, child: str) -> str:
    return "/".join(path_parts(base) + path_parts(child))


def trim_param(param: str) -> str:
    param_no_braces = param[1:-1]
    if "=" in param_no_braces:
        return param_no_braces[:param_no_braces.index("=")]
    return param_no_braces


_WILDCARD_CAPTURE_REGEX = re.compile(r"{[^/{}]+}", re.IGNORECASE)


class SegmentName(Enum):
    SEGMENT = "segment"
    SINGLE_CAPTURE = "single-capture"
    MULTI_CAPTURE = "multi-capture"


class PathSegment:
    """
    A segment of a path pattern.
    """
    name: SegmentName
    value: str
    trimmed: str

    def __str__(self):
        return self.value

    @property
    def is_single_segment_wildcard(self):
        pass

    @property
    def is_multi_segment_wildcard(self):
        pass


class Segment(PathSegment):
    """
    A segment of a path pattern.
    """

    def __init__(self, value: str):
        self.value = value
        self.trimmed = value
        self.name = SegmentName.SEGMENT

    @property
    def is_single_segment_wildcard(self):
        return "*" in self.value and not self.is_multi_segment_wildcard

    @property
    def is_multi_segment_wildcard(self):
        return "**" in self.value


class SingleCaptureSegment(PathSegment):
    """
    A segment of a path pattern that captures a single segment.
    """
    name = SegmentName.SINGLE_CAPTURE

    def __init__(self, value):
        self.value = value
        self.trimmed = trim_param(value)

    @property
    def is_single_segment_wildcard(self):
        return True

    @property
    def is_multi_segment_wildcard(self):
        return False


class MultiCaptureSegment(PathSegment):
    """
    A segment of a path pattern that captures multiple segments.
    """

    name = SegmentName.MULTI_CAPTURE

    def __init__(self, value):
        self.value = value
        self.trimmed = trim_param(value)

    @property
    def is_single_segment_wildcard(self):
        return False

    @property
    def is_multi_segment_wildcard(self):
        return True


class PathPattern:
    """
    Implements Eventarc's path pattern from the spec
    https://cloud.google.com/eventarc/docs/path-patterns
    """
    segments: list[PathSegment]

    def __init__(self, raw_path: str):
        normalized_path = raw_path.strip("/")
        self.raw = normalized_path
        self.segments = []
        self.init_path_segments(normalized_path)

    def init_path_segments(self, raw: str):
        parts = raw.split("/")
        for part in parts:
            segment: PathSegment | None = None
            capture = re.findall(_WILDCARD_CAPTURE_REGEX, part)
            if capture is not None and len(capture) == 1:
                if "**" in part:
                    segment = MultiCaptureSegment(part)
                else:
                    segment = SingleCaptureSegment(part)
            else:
                segment = Segment(part)
            self.segments.append(segment)

    @property
    def value(self) -> str:
        return self.raw

    @property
    def has_wildcards(self) -> bool:
        return any(segment.is_single_segment_wildcard or
                   segment.is_multi_segment_wildcard
                   for segment in self.segments)

    @property
    def has_captures(self) -> bool:
        return any(segment.name in (SegmentName.SINGLE_CAPTURE,
                                    SegmentName.MULTI_CAPTURE)
                   for segment in self.segments)

    def extract_matches(self, path: str) -> dict[str, str]:
        matches: dict[str, str] = {}
        if not self.has_captures:
            return matches
        path_segments = path_parts(path)
        path_ndx = 0
        for segment_ndx in range(len(self.segments)):
            segment = self.segments[segment_ndx]
            remaining_segments = len(self.segments) - 1 - segment_ndx
            next_path_ndx = len(path_segments) - remaining_segments
            if segment.name == SegmentName.SINGLE_CAPTURE:
                matches[segment.trimmed] = path_segments[path_ndx]
            elif segment.name == SegmentName.MULTI_CAPTURE:
                matches[segment.trimmed] = "/".join(
                    path_segments[path_ndx:next_path_ndx])
            path_ndx = next_path_ndx if segment.is_multi_segment_wildcard else path_ndx + 1
        return matches
