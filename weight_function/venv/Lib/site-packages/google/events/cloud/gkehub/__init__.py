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
from google.events.cloud.gkehub import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.gkehub_v1.types.data import ApplianceCluster
from google.events.cloud.gkehub_v1.types.data import Authority
from google.events.cloud.gkehub_v1.types.data import CommonFeatureState
from google.events.cloud.gkehub_v1.types.data import EdgeCluster
from google.events.cloud.gkehub_v1.types.data import Feature
from google.events.cloud.gkehub_v1.types.data import FeatureEventData
from google.events.cloud.gkehub_v1.types.data import FeatureResourceState
from google.events.cloud.gkehub_v1.types.data import FeatureState
from google.events.cloud.gkehub_v1.types.data import GkeCluster
from google.events.cloud.gkehub_v1.types.data import KubernetesMetadata
from google.events.cloud.gkehub_v1.types.data import KubernetesResource
from google.events.cloud.gkehub_v1.types.data import Membership
from google.events.cloud.gkehub_v1.types.data import MembershipBinding
from google.events.cloud.gkehub_v1.types.data import MembershipBindingEventData
from google.events.cloud.gkehub_v1.types.data import MembershipBindingLifecycleState
from google.events.cloud.gkehub_v1.types.data import MembershipEndpoint
from google.events.cloud.gkehub_v1.types.data import MembershipEventData
from google.events.cloud.gkehub_v1.types.data import MembershipFeatureState
from google.events.cloud.gkehub_v1.types.data import MembershipState
from google.events.cloud.gkehub_v1.types.data import MultiCloudCluster
from google.events.cloud.gkehub_v1.types.data import OnPremCluster
from google.events.cloud.gkehub_v1.types.data import ResourceManifest
from google.events.cloud.gkehub_v1.types.data import ResourceOptions
from google.events.cloud.gkehub_v1.types.data import Scope
from google.events.cloud.gkehub_v1.types.data import ScopeEventData
from google.events.cloud.gkehub_v1.types.data import ScopeFeatureState
from google.events.cloud.gkehub_v1.types.data import ScopeLifecycleState

__all__ = ('ApplianceCluster',
    'Authority',
    'CommonFeatureState',
    'EdgeCluster',
    'Feature',
    'FeatureEventData',
    'FeatureResourceState',
    'FeatureState',
    'GkeCluster',
    'KubernetesMetadata',
    'KubernetesResource',
    'Membership',
    'MembershipBinding',
    'MembershipBindingEventData',
    'MembershipBindingLifecycleState',
    'MembershipEndpoint',
    'MembershipEventData',
    'MembershipFeatureState',
    'MembershipState',
    'MultiCloudCluster',
    'OnPremCluster',
    'ResourceManifest',
    'ResourceOptions',
    'Scope',
    'ScopeEventData',
    'ScopeFeatureState',
    'ScopeLifecycleState',
)
