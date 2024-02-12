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
from google.events.cloud.functions import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.functions_v2.types.data import BuildConfig
from google.events.cloud.functions_v2.types.data import EventFilter
from google.events.cloud.functions_v2.types.data import EventTrigger
from google.events.cloud.functions_v2.types.data import Function
from google.events.cloud.functions_v2.types.data import FunctionEventData
from google.events.cloud.functions_v2.types.data import RepoSource
from google.events.cloud.functions_v2.types.data import SecretEnvVar
from google.events.cloud.functions_v2.types.data import SecretVolume
from google.events.cloud.functions_v2.types.data import ServiceConfig
from google.events.cloud.functions_v2.types.data import Source
from google.events.cloud.functions_v2.types.data import SourceProvenance
from google.events.cloud.functions_v2.types.data import StateMessage
from google.events.cloud.functions_v2.types.data import StorageSource
from google.events.cloud.functions_v2.types.data import Environment

__all__ = ('BuildConfig',
    'EventFilter',
    'EventTrigger',
    'Function',
    'FunctionEventData',
    'RepoSource',
    'SecretEnvVar',
    'SecretVolume',
    'ServiceConfig',
    'Source',
    'SourceProvenance',
    'StateMessage',
    'StorageSource',
    'Environment',
)
