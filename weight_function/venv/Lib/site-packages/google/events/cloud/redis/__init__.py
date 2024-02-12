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
from google.events.cloud.redis import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.redis_v1.types.data import Instance
from google.events.cloud.redis_v1.types.data import InstanceEventData
from google.events.cloud.redis_v1.types.data import MaintenancePolicy
from google.events.cloud.redis_v1.types.data import MaintenanceSchedule
from google.events.cloud.redis_v1.types.data import NodeInfo
from google.events.cloud.redis_v1.types.data import PersistenceConfig
from google.events.cloud.redis_v1.types.data import TlsCertificate
from google.events.cloud.redis_v1.types.data import WeeklyMaintenanceWindow

__all__ = ('Instance',
    'InstanceEventData',
    'MaintenancePolicy',
    'MaintenanceSchedule',
    'NodeInfo',
    'PersistenceConfig',
    'TlsCertificate',
    'WeeklyMaintenanceWindow',
)
