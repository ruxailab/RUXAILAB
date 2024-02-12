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
from google.events.cloud.notebooks_v1 import gapic_version as package_version

__version__ = package_version.__version__



from .types.data import ContainerImage
from .types.data import EncryptionConfig
from .types.data import Environment
from .types.data import EnvironmentEventData
from .types.data import Execution
from .types.data import ExecutionEventData
from .types.data import ExecutionTemplate
from .types.data import Instance
from .types.data import InstanceEventData
from .types.data import LocalDisk
from .types.data import LocalDiskInitializeParams
from .types.data import ReservationAffinity
from .types.data import Runtime
from .types.data import RuntimeAcceleratorConfig
from .types.data import RuntimeAccessConfig
from .types.data import RuntimeEventData
from .types.data import RuntimeMetrics
from .types.data import RuntimeShieldedInstanceConfig
from .types.data import RuntimeSoftwareConfig
from .types.data import Schedule
from .types.data import ScheduleEventData
from .types.data import VirtualMachine
from .types.data import VirtualMachineConfig
from .types.data import VmImage

__all__ = (
'ContainerImage',
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
