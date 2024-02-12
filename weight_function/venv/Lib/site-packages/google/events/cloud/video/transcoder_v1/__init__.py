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
from google.events.cloud.video.transcoder_v1 import gapic_version as package_version

__version__ = package_version.__version__



from .types.data import AdBreak
from .types.data import AudioStream
from .types.data import EditAtom
from .types.data import ElementaryStream
from .types.data import Input
from .types.data import Job
from .types.data import JobConfig
from .types.data import JobEventData
from .types.data import JobTemplate
from .types.data import JobTemplateEventData
from .types.data import Manifest
from .types.data import MuxStream
from .types.data import Output
from .types.data import Overlay
from .types.data import PreprocessingConfig
from .types.data import PubsubDestination
from .types.data import SegmentSettings
from .types.data import SpriteSheet
from .types.data import TextStream
from .types.data import VideoStream

__all__ = (
'AdBreak',
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
