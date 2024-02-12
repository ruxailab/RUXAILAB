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
from google.events.cloud.cloudbuild import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.cloudbuild_v1.types.data import Artifacts
from google.events.cloud.cloudbuild_v1.types.data import BuildEventData
from google.events.cloud.cloudbuild_v1.types.data import BuildOptions
from google.events.cloud.cloudbuild_v1.types.data import BuildStep
from google.events.cloud.cloudbuild_v1.types.data import BuiltImage
from google.events.cloud.cloudbuild_v1.types.data import FileHashes
from google.events.cloud.cloudbuild_v1.types.data import Hash
from google.events.cloud.cloudbuild_v1.types.data import RepoSource
from google.events.cloud.cloudbuild_v1.types.data import Results
from google.events.cloud.cloudbuild_v1.types.data import Secret
from google.events.cloud.cloudbuild_v1.types.data import Source
from google.events.cloud.cloudbuild_v1.types.data import SourceProvenance
from google.events.cloud.cloudbuild_v1.types.data import StorageSource
from google.events.cloud.cloudbuild_v1.types.data import TimeSpan
from google.events.cloud.cloudbuild_v1.types.data import Volume

__all__ = ('Artifacts',
    'BuildEventData',
    'BuildOptions',
    'BuildStep',
    'BuiltImage',
    'FileHashes',
    'Hash',
    'RepoSource',
    'Results',
    'Secret',
    'Source',
    'SourceProvenance',
    'StorageSource',
    'TimeSpan',
    'Volume',
)
