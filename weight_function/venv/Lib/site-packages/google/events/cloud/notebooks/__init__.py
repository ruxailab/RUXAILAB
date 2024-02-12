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
from google.events.cloud.notebooks import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.notebooks_v1.types.data import ContainerImage
from google.events.cloud.notebooks_v1.types.data import EncryptionConfig
from google.events.cloud.notebooks_v1.types.data import Environment
from google.events.cloud.notebooks_v1.types.data import EnvironmentEventData
from google.events.cloud.notebooks_v1.types.data import Execution
from google.events.cloud.notebooks_v1.types.data import ExecutionEventData
from google.events.cloud.notebooks_v1.types.data import ExecutionTemplate
from google.events.cloud.notebooks_v1.types.data import Instance
from google.events.cloud.notebooks_v1.types.data import InstanceEventData
from google.events.cloud.notebooks_v1.types.data import LocalDisk
from google.events.cloud.notebooks_v1.types.data import LocalDiskInitializeParams
from google.events.cloud.notebooks_v1.types.data import ReservationAffinity
from google.events.cloud.notebooks_v1.types.data import Runtime
from google.events.cloud.notebooks_v1.types.data import RuntimeAcceleratorConfig
from google.events.cloud.notebooks_v1.types.data import RuntimeAccessConfig
from google.events.cloud.notebooks_v1.types.data import RuntimeEventData
from google.events.cloud.notebooks_v1.types.data import RuntimeMetrics
from google.events.cloud.notebooks_v1.types.data import RuntimeShieldedInstanceConfig
from google.events.cloud.notebooks_v1.types.data import RuntimeSoftwareConfig
from google.events.cloud.notebooks_v1.types.data import Schedule
from google.events.cloud.notebooks_v1.types.data import ScheduleEventData
from google.events.cloud.notebooks_v1.types.data import VirtualMachine
from google.events.cloud.notebooks_v1.types.data import VirtualMachineConfig
from google.events.cloud.notebooks_v1.types.data import VmImage

__all__ = ('ContainerImage',
    'EncryptionConfig',
    'Environment',
    'EnvironmentEventData',
    'Execution',
    'ExecutionEventData',
    'ExecutionTemplate',
    'Instance',
    'InstanceEventData',
    'LocalDisk',
    'LocalDiskInitializeParams',
    'ReservationAffinity',
    'Runtime',
    'RuntimeAcceleratorConfig',
    'RuntimeAccessConfig',
    'RuntimeEventData',
    'RuntimeMetrics',
    'RuntimeShieldedInstanceConfig',
    'RuntimeSoftwareConfig',
    'Schedule',
    'ScheduleEventData',
    'VirtualMachine',
    'VirtualMachineConfig',
    'VmImage',
)
