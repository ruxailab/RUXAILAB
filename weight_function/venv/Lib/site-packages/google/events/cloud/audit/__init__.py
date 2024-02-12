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
from google.events.cloud.audit import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.audit_v1.types.data import AuditLog
from google.events.cloud.audit_v1.types.data import AuthenticationInfo
from google.events.cloud.audit_v1.types.data import AuthorizationInfo
from google.events.cloud.audit_v1.types.data import LogEntryData
from google.events.cloud.audit_v1.types.data import LogEntryOperation
from google.events.cloud.audit_v1.types.data import LogSplit
from google.events.cloud.audit_v1.types.data import RequestMetadata
from google.events.cloud.audit_v1.types.data import ResourceLocation
from google.events.cloud.audit_v1.types.data import ServiceAccountDelegationInfo
from google.events.cloud.audit_v1.types.data import LogSeverity

__all__ = ('AuditLog',
    'AuthenticationInfo',
    'AuthorizationInfo',
    'LogEntryData',
    'LogEntryOperation',
    'LogSplit',
    'RequestMetadata',
    'ResourceLocation',
    'ServiceAccountDelegationInfo',
    'LogSeverity',
)
