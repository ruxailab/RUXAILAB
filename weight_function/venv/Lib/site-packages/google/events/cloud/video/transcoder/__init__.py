# -*- coding: utf-8 -*-
# Copyright 2023 Google LLC
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
#
from google.events.cloud.video.transcoder import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.video.transcoder_v1.types.data import AdBreak
from google.events.cloud.video.transcoder_v1.types.data import AudioStream
from google.events.cloud.video.transcoder_v1.types.data import EditAtom
from google.events.cloud.video.transcoder_v1.types.data import ElementaryStream
from google.events.cloud.video.transcoder_v1.types.data import Input
from google.events.cloud.video.transcoder_v1.types.data import Job
from google.events.cloud.video.transcoder_v1.types.data import JobConfig
from google.events.cloud.video.transcoder_v1.types.data import JobEventData
from google.events.cloud.video.transcoder_v1.types.data import JobTemplate
from google.events.cloud.video.transcoder_v1.types.data import JobTemplateEventData
from google.events.cloud.video.transcoder_v1.types.data import Manifest
from google.events.cloud.video.transcoder_v1.types.data import MuxStream
from google.events.cloud.video.transcoder_v1.types.data import Output
from google.events.cloud.video.transcoder_v1.types.data import Overlay
from google.events.cloud.video.transcoder_v1.types.data import PreprocessingConfig
from google.events.cloud.video.transcoder_v1.types.data import PubsubDestination
from google.events.cloud.video.transcoder_v1.types.data import SegmentSettings
from google.events.cloud.video.transcoder_v1.types.data import SpriteSheet
from google.events.cloud.video.transcoder_v1.types.data import TextStream
from google.events.cloud.video.transcoder_v1.types.data import VideoStream

__all__ = ('AdBreak',
    'AudioStream',
    'EditAtom',
    'ElementaryStream',
    'Input',
    'Job',
    'JobConfig',
    'JobEventData',
    'JobTemplate',
    'JobTemplateEventData',
    'Manifest',
    'MuxStream',
    'Output',
    'Overlay',
    'PreprocessingConfig',
    'PubsubDestination',
    'SegmentSettings',
    'SpriteSheet',
    'TextStream',
    'VideoStream',
)
