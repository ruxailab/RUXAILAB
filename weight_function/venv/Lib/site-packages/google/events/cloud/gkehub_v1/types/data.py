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
from __future__ import annotations

from typing import MutableMapping, MutableSequence

import proto  # type: ignore

from google.protobuf import timestamp_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.gkehub.v1',
    manifest={
        'Feature',
        'FeatureResourceState',
        'FeatureState',
        'CommonFeatureState',
        'ScopeFeatureState',
        'MembershipFeatureState',
        'Scope',
        'ScopeLifecycleState',
        'MembershipBinding',
        'MembershipBindingLifecycleState',
        'Membership',
        'MembershipEndpoint',
        'KubernetesResource',
        'ResourceOptions',
        'ResourceManifest',
        'GkeCluster',
        'OnPremCluster',
        'MultiCloudCluster',
        'EdgeCluster',
        'ApplianceCluster',
        'KubernetesMetadata',
        'MembershipState',
        'Authority',
        'ScopeEventData',
        'MembershipEventData',
        'FeatureEventData',
        'MembershipBindingEventData',
    },
)


class Feature(proto.Message):
    r"""Feature represents the settings and status of any Hub
    Feature.

    Attributes:
        name (str):
            Output only. The full, unique name of this Feature resource
            in the format ``projects/*/locations/*/features/*``.
        labels (MutableMapping[str, str]):
            GCP labels for this Feature.
        resource_state (google.events.cloud.gkehub_v1.types.FeatureResourceState):
            Output only. State of the Feature resource
            itself.
        state (google.events.cloud.gkehub_v1.types.CommonFeatureState):
            Output only. The Hub-wide Feature state.
        membership_states (MutableMapping[str, google.events.cloud.gkehub_v1.types.MembershipFeatureState]):
            Output only. Membership-specific Feature status. If this
            Feature does report any per-Membership status, this field
            may be unused.

            The keys indicate which Membership the state is for, in the
            form:

            ``projects/{p}/locations/{l}/memberships/{m}``

            Where {p} is the project number, {l} is a valid location and
            {m} is a valid Membership in this project at that location.
            {p} MUST match the Feature's project number.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the Feature resource was
            created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the Feature resource was
            last updated.
        delete_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the Feature resource was
            deleted.
        scope_states (MutableMapping[str, google.events.cloud.gkehub_v1.types.ScopeFeatureState]):
            Output only. Scope-specific Feature status. If this Feature
            does report any per-Scope status, this field may be unused.

            The keys indicate which Scope the state is for, in the form:

            ``projects/{p}/locations/global/scopes/{s}``

            Where {p} is the project, {s} is a valid Scope in this
            project. {p} WILL match the Feature's project.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=2,
    )
    resource_state: 'FeatureResourceState' = proto.Field(
        proto.MESSAGE,
        number=3,
        message='FeatureResourceState',
    )
    state: 'CommonFeatureState' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='CommonFeatureState',
    )
    membership_states: MutableMapping[str, 'MembershipFeatureState'] = proto.MapField(
        proto.STRING,
        proto.MESSAGE,
        number=7,
        message='MembershipFeatureState',
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=8,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=9,
        message=timestamp_pb2.Timestamp,
    )
    delete_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=10,
        message=timestamp_pb2.Timestamp,
    )
    scope_states: MutableMapping[str, 'ScopeFeatureState'] = proto.MapField(
        proto.STRING,
        proto.MESSAGE,
        number=13,
        message='ScopeFeatureState',
    )


class FeatureResourceState(proto.Message):
    r"""FeatureResourceState describes the state of a Feature *resource* in
    the GkeHub API. See ``FeatureState`` for the "running state" of the
    Feature in the Hub and across Memberships.

    Attributes:
        state (google.events.cloud.gkehub_v1.types.FeatureResourceState.State):
            The current state of the Feature resource in
            the Hub API.
    """
    class State(proto.Enum):
        r"""State describes the lifecycle status of a Feature.

        Values:
            STATE_UNSPECIFIED (0):
                State is unknown or not set.
            ENABLING (1):
                The Feature is being enabled, and the Feature
                resource is being created. Once complete, the
                corresponding Feature will be enabled in this
                Hub.
            ACTIVE (2):
                The Feature is enabled in this Hub, and the
                Feature resource is fully available.
            DISABLING (3):
                The Feature is being disabled in this Hub,
                and the Feature resource is being deleted.
            UPDATING (4):
                The Feature resource is being updated.
            SERVICE_UPDATING (5):
                The Feature resource is being updated by the
                Hub Service.
        """
        STATE_UNSPECIFIED = 0
        ENABLING = 1
        ACTIVE = 2
        DISABLING = 3
        UPDATING = 4
        SERVICE_UPDATING = 5

    state: State = proto.Field(
        proto.ENUM,
        number=1,
        enum=State,
    )


class FeatureState(proto.Message):
    r"""FeatureState describes the high-level state of a Feature. It
    may be used to describe a Feature's state at the environ-level,
    or per-membershop, depending on the context.

    Attributes:
        code (google.events.cloud.gkehub_v1.types.FeatureState.Code):
            The high-level, machine-readable status of
            this Feature.
        description (str):
            A human-readable description of the current
            status.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            The time this status and any related
            Feature-specific details were updated.
    """
    class Code(proto.Enum):
        r"""Code represents a machine-readable, high-level status of the
        Feature.

        Values:
            CODE_UNSPECIFIED (0):
                Unknown or not set.
            OK (1):
                The Feature is operating normally.
            WARNING (2):
                The Feature has encountered an issue, and is
                operating in a degraded state. The Feature may
                need intervention to return to normal operation.
                See the description and any associated
                Feature-specific details for more information.
            ERROR (3):
                The Feature is not operating or is in a
                severely degraded state. The Feature may need
                intervention to return to normal operation. See
                the description and any associated
                Feature-specific details for more information.
        """
        CODE_UNSPECIFIED = 0
        OK = 1
        WARNING = 2
        ERROR = 3

    code: Code = proto.Field(
        proto.ENUM,
        number=1,
        enum=Code,
    )
    description: str = proto.Field(
        proto.STRING,
        number=2,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )


class CommonFeatureState(proto.Message):
    r"""CommonFeatureState contains Hub-wide Feature status
    information.

    Attributes:
        state (google.events.cloud.gkehub_v1.types.FeatureState):
            Output only. The "running state" of the
            Feature in this Hub.
    """

    state: 'FeatureState' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='FeatureState',
    )


class ScopeFeatureState(proto.Message):
    r"""ScopeFeatureState contains Scope-wide Feature status
    information.

    Attributes:
        state (google.events.cloud.gkehub_v1.types.FeatureState):
            Output only. The "running state" of the
            Feature in this Scope.
    """

    state: 'FeatureState' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='FeatureState',
    )


class MembershipFeatureState(proto.Message):
    r"""MembershipFeatureState contains Feature status information
    for a single Membership.

    Attributes:
        state (google.events.cloud.gkehub_v1.types.FeatureState):
            The high-level state of this Feature for a
            single membership.
    """

    state: 'FeatureState' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='FeatureState',
    )


class Scope(proto.Message):
    r"""Scope represents a Scope in a Fleet.

    Attributes:
        name (str):
            The resource name for the scope
            ``projects/{project}/locations/{location}/scopes/{scope}``
        uid (str):
            Output only. Google-generated UUID for this
            resource. This is unique across all scope
            resources. If a scope resource is deleted and
            another resource with the same name is created,
            it gets a different uid.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the scope was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the scope was last updated.
        delete_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the scope was deleted.
        state (google.events.cloud.gkehub_v1.types.ScopeLifecycleState):
            Output only. State of the scope resource.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    uid: str = proto.Field(
        proto.STRING,
        number=2,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )
    delete_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=5,
        message=timestamp_pb2.Timestamp,
    )
    state: 'ScopeLifecycleState' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='ScopeLifecycleState',
    )


class ScopeLifecycleState(proto.Message):
    r"""ScopeLifecycleState describes the state of a Scope resource.

    Attributes:
        code (google.events.cloud.gkehub_v1.types.ScopeLifecycleState.Code):
            Output only. The current state of the scope
            resource.
    """
    class Code(proto.Enum):
        r"""Code describes the state of a Scope resource.

        Values:
            CODE_UNSPECIFIED (0):
                The code is not set.
            CREATING (1):
                The scope is being created.
            READY (2):
                The scope active.
            DELETING (3):
                The scope is being deleted.
            UPDATING (4):
                The scope is being updated.
        """
        CODE_UNSPECIFIED = 0
        CREATING = 1
        READY = 2
        DELETING = 3
        UPDATING = 4

    code: Code = proto.Field(
        proto.ENUM,
        number=1,
        enum=Code,
    )


class MembershipBinding(proto.Message):
    r"""MembershipBinding is a subresource of a Membership,
    representing what Fleet Scopes (or other, future Fleet
    resources) a Membership is bound to.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        scope (str):
            A Workspace resource name in the format
            ``projects/*/locations/*/scopes/*``.

            This field is a member of `oneof`_ ``target``.
        fleet (bool):
            Whether the membershipbinding is Fleet-wide;
            true means that this Membership should be bound
            to all Namespaces in this entire Fleet.

            This field is a member of `oneof`_ ``target``.
        name (str):
            The resource name for the membershipbinding itself
            ``projects/{project}/locations/{location}/memberships/{membership}/bindings/{membershipbinding}``
        uid (str):
            Output only. Google-generated UUID for this
            resource. This is unique across all
            membershipbinding resources. If a
            membershipbinding resource is deleted and
            another resource with the same name is created,
            it gets a different uid.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the membership binding was
            created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the membership binding was
            last updated.
        delete_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the membership binding was
            deleted.
        state (google.events.cloud.gkehub_v1.types.MembershipBindingLifecycleState):
            Output only. State of the membership binding
            resource.
    """

    scope: str = proto.Field(
        proto.STRING,
        number=3,
        oneof='target',
    )
    fleet: bool = proto.Field(
        proto.BOOL,
        number=4,
        oneof='target',
    )
    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    uid: str = proto.Field(
        proto.STRING,
        number=2,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=5,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=6,
        message=timestamp_pb2.Timestamp,
    )
    delete_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    state: 'MembershipBindingLifecycleState' = proto.Field(
        proto.MESSAGE,
        number=8,
        message='MembershipBindingLifecycleState',
    )


class MembershipBindingLifecycleState(proto.Message):
    r"""MembershipBindingLifecycleState describes the state of a
    Binding resource.

    Attributes:
        code (google.events.cloud.gkehub_v1.types.MembershipBindingLifecycleState.Code):
            Output only. The current state of the
            MembershipBinding resource.
    """
    class Code(proto.Enum):
        r"""Code describes the state of a MembershipBinding resource.

        Values:
            CODE_UNSPECIFIED (0):
                The code is not set.
            CREATING (1):
                The membershipbinding is being created.
            READY (2):
                The membershipbinding active.
            DELETING (3):
                The membershipbinding is being deleted.
            UPDATING (4):
                The membershipbinding is being updated.
        """
        CODE_UNSPECIFIED = 0
        CREATING = 1
        READY = 2
        DELETING = 3
        UPDATING = 4

    code: Code = proto.Field(
        proto.ENUM,
        number=1,
        enum=Code,
    )


class Membership(proto.Message):
    r"""Membership contains information about a member cluster.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        endpoint (google.events.cloud.gkehub_v1.types.MembershipEndpoint):
            Optional. Endpoint information to reach this
            member.

            This field is a member of `oneof`_ ``type``.
        name (str):
            Output only. The full, unique name of this Membership
            resource in the format
            ``projects/*/locations/*/memberships/{membership_id}``, set
            during creation.

            ``membership_id`` must be a valid RFC 1123 compliant DNS
            label:

            1. At most 63 characters in length
            2. It must consist of lower case alphanumeric characters or
               ``-``
            3. It must start and end with an alphanumeric character

            Which can be expressed as the regex:
            ``[a-z0-9]([-a-z0-9]*[a-z0-9])?``, with a maximum length of
            63 characters.
        labels (MutableMapping[str, str]):
            Optional. GCP labels for this membership.
        description (str):
            Output only. Description of this membership, limited to 63
            characters. Must match the regex:
            ``[a-zA-Z0-9][a-zA-Z0-9_\-\.\ ]*``

            This field is present for legacy purposes.
        state (google.events.cloud.gkehub_v1.types.MembershipState):
            Output only. State of the Membership
            resource.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the Membership was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the Membership was last
            updated.
        delete_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. When the Membership was deleted.
        external_id (str):
            Optional. An externally-generated and managed ID for this
            Membership. This ID may be modified after creation, but this
            is not recommended.

            The ID must match the regex:
            ``[a-zA-Z0-9][a-zA-Z0-9_\-\.]*``

            If this Membership represents a Kubernetes cluster, this
            value should be set to the UID of the ``kube-system``
            namespace object.
        last_connection_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. For clusters using Connect, the
            timestamp of the most recent connection
            established with Google Cloud. This time is
            updated every several minutes, not continuously.
            For clusters that do not use GKE Connect, or
            that have never connected successfully, this
            field will be unset.
        unique_id (str):
            Output only. Google-generated UUID for this resource. This
            is unique across all Membership resources. If a Membership
            resource is deleted and another resource with the same name
            is created, it gets a different unique_id.
        authority (google.events.cloud.gkehub_v1.types.Authority):
            Optional. How to identify workloads from this
            Membership. See the documentation on Workload
            Identity for more details:

            https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity
    """

    endpoint: 'MembershipEndpoint' = proto.Field(
        proto.MESSAGE,
        number=4,
        oneof='type',
        message='MembershipEndpoint',
    )
    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=2,
    )
    description: str = proto.Field(
        proto.STRING,
        number=3,
    )
    state: 'MembershipState' = proto.Field(
        proto.MESSAGE,
        number=5,
        message='MembershipState',
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=6,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    delete_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=8,
        message=timestamp_pb2.Timestamp,
    )
    external_id: str = proto.Field(
        proto.STRING,
        number=9,
    )
    last_connection_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=10,
        message=timestamp_pb2.Timestamp,
    )
    unique_id: str = proto.Field(
        proto.STRING,
        number=11,
    )
    authority: 'Authority' = proto.Field(
        proto.MESSAGE,
        number=12,
        message='Authority',
    )


class MembershipEndpoint(proto.Message):
    r"""MembershipEndpoint contains information needed to contact a
    Kubernetes API, endpoint and any additional Kubernetes metadata.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        gke_cluster (google.events.cloud.gkehub_v1.types.GkeCluster):
            Optional. Specific information for a
            GKE-on-GCP cluster.

            This field is a member of `oneof`_ ``type``.
        on_prem_cluster (google.events.cloud.gkehub_v1.types.OnPremCluster):
            Optional. Specific information for a GKE
            On-Prem cluster. An onprem user-cluster who has
            no resourceLink is not allowed to use this
            field, it should have a nil "type" instead.

            This field is a member of `oneof`_ ``type``.
        multi_cloud_cluster (google.events.cloud.gkehub_v1.types.MultiCloudCluster):
            Optional. Specific information for a GKE
            Multi-Cloud cluster.

            This field is a member of `oneof`_ ``type``.
        edge_cluster (google.events.cloud.gkehub_v1.types.EdgeCluster):
            Optional. Specific information for a Google
            Edge cluster.

            This field is a member of `oneof`_ ``type``.
        appliance_cluster (google.events.cloud.gkehub_v1.types.ApplianceCluster):
            Optional. Specific information for a GDC Edge
            Appliance cluster.

            This field is a member of `oneof`_ ``type``.
        kubernetes_metadata (google.events.cloud.gkehub_v1.types.KubernetesMetadata):
            Output only. Useful Kubernetes-specific
            metadata.
        kubernetes_resource (google.events.cloud.gkehub_v1.types.KubernetesResource):
            Optional. The in-cluster Kubernetes Resources that should be
            applied for a correctly registered cluster, in the steady
            state. These resources:

            -  Ensure that the cluster is exclusively registered to one
               and only one Hub Membership.
            -  Propagate Workload Pool Information available in the
               Membership Authority field.
            -  Ensure proper initial configuration of default Hub
               Features.
        google_managed (bool):
            Output only. Whether the lifecycle of this
            membership is managed by a google cluster
            platform service.
    """

    gke_cluster: 'GkeCluster' = proto.Field(
        proto.MESSAGE,
        number=1,
        oneof='type',
        message='GkeCluster',
    )
    on_prem_cluster: 'OnPremCluster' = proto.Field(
        proto.MESSAGE,
        number=4,
        oneof='type',
        message='OnPremCluster',
    )
    multi_cloud_cluster: 'MultiCloudCluster' = proto.Field(
        proto.MESSAGE,
        number=5,
        oneof='type',
        message='MultiCloudCluster',
    )
    edge_cluster: 'EdgeCluster' = proto.Field(
        proto.MESSAGE,
        number=6,
        oneof='type',
        message='EdgeCluster',
    )
    appliance_cluster: 'ApplianceCluster' = proto.Field(
        proto.MESSAGE,
        number=7,
        oneof='type',
        message='ApplianceCluster',
    )
    kubernetes_metadata: 'KubernetesMetadata' = proto.Field(
        proto.MESSAGE,
        number=2,
        message='KubernetesMetadata',
    )
    kubernetes_resource: 'KubernetesResource' = proto.Field(
        proto.MESSAGE,
        number=3,
        message='KubernetesResource',
    )
    google_managed: bool = proto.Field(
        proto.BOOL,
        number=8,
    )


class KubernetesResource(proto.Message):
    r"""KubernetesResource contains the YAML manifests and
    configuration for Membership Kubernetes resources in the
    cluster. After CreateMembership or UpdateMembership, these
    resources should be re-applied in the cluster.

    Attributes:
        membership_resources (MutableSequence[google.events.cloud.gkehub_v1.types.ResourceManifest]):
            Output only. Additional Kubernetes resources
            that need to be applied to the cluster after
            Membership creation, and after every update.

            This field is only populated in the Membership
            returned from a successful long-running
            operation from CreateMembership or
            UpdateMembership. It is not populated during
            normal GetMembership or ListMemberships
            requests. To get the resource manifest after the
            initial registration, the caller should make a
            UpdateMembership call with an empty field mask.
        connect_resources (MutableSequence[google.events.cloud.gkehub_v1.types.ResourceManifest]):
            Output only. The Kubernetes resources for
            installing the GKE Connect agent
            This field is only populated in the Membership
            returned from a successful long-running
            operation from CreateMembership or
            UpdateMembership. It is not populated during
            normal GetMembership or ListMemberships
            requests. To get the resource manifest after the
            initial registration, the caller should make a
            UpdateMembership call with an empty field mask.
        resource_options (google.events.cloud.gkehub_v1.types.ResourceOptions):
            Optional. Options for Kubernetes resource
            generation.
    """

    membership_resources: MutableSequence['ResourceManifest'] = proto.RepeatedField(
        proto.MESSAGE,
        number=2,
        message='ResourceManifest',
    )
    connect_resources: MutableSequence['ResourceManifest'] = proto.RepeatedField(
        proto.MESSAGE,
        number=3,
        message='ResourceManifest',
    )
    resource_options: 'ResourceOptions' = proto.Field(
        proto.MESSAGE,
        number=4,
        message='ResourceOptions',
    )


class ResourceOptions(proto.Message):
    r"""ResourceOptions represent options for Kubernetes resource
    generation.

    Attributes:
        connect_version (str):
            Optional. The Connect agent version to use for
            connect_resources. Defaults to the latest GKE Connect
            version. The version must be a currently supported version,
            obsolete versions will be rejected.
        v1beta1_crd (bool):
            Optional. Use ``apiextensions/v1beta1`` instead of
            ``apiextensions/v1`` for CustomResourceDefinition resources.
            This option should be set for clusters with Kubernetes
            apiserver versions <1.16.
        k8s_version (str):
            Optional. Major version of the Kubernetes cluster. This is
            only used to determine which version to use for the
            CustomResourceDefinition resources,
            ``apiextensions/v1beta1`` or\ ``apiextensions/v1``.
    """

    connect_version: str = proto.Field(
        proto.STRING,
        number=1,
    )
    v1beta1_crd: bool = proto.Field(
        proto.BOOL,
        number=2,
    )
    k8s_version: str = proto.Field(
        proto.STRING,
        number=3,
    )


class ResourceManifest(proto.Message):
    r"""ResourceManifest represents a single Kubernetes resource to
    be applied to the cluster.

    Attributes:
        manifest (str):
            YAML manifest of the resource.
        cluster_scoped (bool):
            Whether the resource provided in the manifest is
            ``cluster_scoped``. If unset, the manifest is assumed to be
            namespace scoped.

            This field is used for REST mapping when applying the
            resource in a cluster.
    """

    manifest: str = proto.Field(
        proto.STRING,
        number=1,
    )
    cluster_scoped: bool = proto.Field(
        proto.BOOL,
        number=2,
    )


class GkeCluster(proto.Message):
    r"""GkeCluster contains information specific to GKE clusters.

    Attributes:
        resource_link (str):
            Immutable. Self-link of the GCP resource for
            the GKE cluster. For example:
            //container.googleapis.com/projects/my-project/locations/us-west1-a/clusters/my-cluster

            Zonal clusters are also supported.
        cluster_missing (bool):
            Output only. If cluster_missing is set then it denotes that
            the GKE cluster no longer exists in the GKE Control Plane.
    """

    resource_link: str = proto.Field(
        proto.STRING,
        number=1,
    )
    cluster_missing: bool = proto.Field(
        proto.BOOL,
        number=2,
    )


class OnPremCluster(proto.Message):
    r"""OnPremCluster contains information specific to GKE On-Prem
    clusters.

    Attributes:
        resource_link (str):
            Immutable. Self-link of the GCP resource for
            the GKE On-Prem cluster. For example:

            //gkeonprem.googleapis.com/projects/my-project/locations/us-west1-a/vmwareClusters/my-cluster
            //gkeonprem.googleapis.com/projects/my-project/locations/us-west1-a/bareMetalClusters/my-cluster
        cluster_missing (bool):
            Output only. If cluster_missing is set then it denotes that
            API(gkeonprem.googleapis.com) resource for this GKE On-Prem
            cluster no longer exists.
        admin_cluster (bool):
            Immutable. Whether the cluster is an admin
            cluster.
        cluster_type (google.events.cloud.gkehub_v1.types.OnPremCluster.ClusterType):
            Immutable. The on prem cluster's type.
    """
    class ClusterType(proto.Enum):
        r"""ClusterType describes on prem cluster's type.

        Values:
            CLUSTERTYPE_UNSPECIFIED (0):
                The ClusterType is not set.
            BOOTSTRAP (1):
                The ClusterType is bootstrap cluster.
            HYBRID (2):
                The ClusterType is baremetal hybrid cluster.
            STANDALONE (3):
                The ClusterType is baremetal standalone
                cluster.
            USER (4):
                The ClusterType is user cluster.
        """
        CLUSTERTYPE_UNSPECIFIED = 0
        BOOTSTRAP = 1
        HYBRID = 2
        STANDALONE = 3
        USER = 4

    resource_link: str = proto.Field(
        proto.STRING,
        number=1,
    )
    cluster_missing: bool = proto.Field(
        proto.BOOL,
        number=2,
    )
    admin_cluster: bool = proto.Field(
        proto.BOOL,
        number=3,
    )
    cluster_type: ClusterType = proto.Field(
        proto.ENUM,
        number=4,
        enum=ClusterType,
    )


class MultiCloudCluster(proto.Message):
    r"""MultiCloudCluster contains information specific to GKE
    Multi-Cloud clusters.

    Attributes:
        resource_link (str):
            Immutable. Self-link of the GCP resource for
            the GKE Multi-Cloud cluster. For example:

            //gkemulticloud.googleapis.com/projects/my-project/locations/us-west1-a/awsClusters/my-cluster
            //gkemulticloud.googleapis.com/projects/my-project/locations/us-west1-a/azureClusters/my-cluster
            //gkemulticloud.googleapis.com/projects/my-project/locations/us-west1-a/attachedClusters/my-cluster
        cluster_missing (bool):
            Output only. If cluster_missing is set then it denotes that
            API(gkemulticloud.googleapis.com) resource for this GKE
            Multi-Cloud cluster no longer exists.
    """

    resource_link: str = proto.Field(
        proto.STRING,
        number=1,
    )
    cluster_missing: bool = proto.Field(
        proto.BOOL,
        number=2,
    )


class EdgeCluster(proto.Message):
    r"""EdgeCluster contains information specific to Google Edge
    Clusters.

    Attributes:
        resource_link (str):
            Immutable. Self-link of the GCP resource for
            the Edge Cluster. For example:

            //edgecontainer.googleapis.com/projects/my-project/locations/us-west1-a/clusters/my-cluster
    """

    resource_link: str = proto.Field(
        proto.STRING,
        number=1,
    )


class ApplianceCluster(proto.Message):
    r"""ApplianceCluster contains information specific to GDC Edge
    Appliance Clusters.

    Attributes:
        resource_link (str):
            Immutable. Self-link of the GCP resource for
            the Appliance Cluster. For example:

            //transferappliance.googleapis.com/projects/my-project/locations/us-west1-a/appliances/my-appliance
    """

    resource_link: str = proto.Field(
        proto.STRING,
        number=1,
    )


class KubernetesMetadata(proto.Message):
    r"""KubernetesMetadata provides informational metadata for
    Memberships representing Kubernetes clusters.

    Attributes:
        kubernetes_api_server_version (str):
            Output only. Kubernetes API server version string as
            reported by ``/version``.
        node_provider_id (str):
            Output only. Node providerID as reported by the first node
            in the list of nodes on the Kubernetes endpoint. On
            Kubernetes platforms that support zero-node clusters (like
            GKE-on-GCP), the node_count will be zero and the
            node_provider_id will be empty.
        node_count (int):
            Output only. Node count as reported by
            Kubernetes nodes resources.
        vcpu_count (int):
            Output only. vCPU count as reported by
            Kubernetes nodes resources.
        memory_mb (int):
            Output only. The total memory capacity as
            reported by the sum of all Kubernetes nodes
            resources, defined in MB.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The time at which these details were last
            updated. This update_time is different from the
            Membership-level update_time since EndpointDetails are
            updated internally for API consumers.
    """

    kubernetes_api_server_version: str = proto.Field(
        proto.STRING,
        number=1,
    )
    node_provider_id: str = proto.Field(
        proto.STRING,
        number=2,
    )
    node_count: int = proto.Field(
        proto.INT32,
        number=3,
    )
    vcpu_count: int = proto.Field(
        proto.INT32,
        number=4,
    )
    memory_mb: int = proto.Field(
        proto.INT32,
        number=5,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=100,
        message=timestamp_pb2.Timestamp,
    )


class MembershipState(proto.Message):
    r"""MembershipState describes the state of a Membership resource.

    Attributes:
        code (google.events.cloud.gkehub_v1.types.MembershipState.Code):
            Output only. The current state of the
            Membership resource.
    """
    class Code(proto.Enum):
        r"""Code describes the state of a Membership resource.

        Values:
            CODE_UNSPECIFIED (0):
                The code is not set.
            CREATING (1):
                The cluster is being registered.
            READY (2):
                The cluster is registered.
            DELETING (3):
                The cluster is being unregistered.
            UPDATING (4):
                The Membership is being updated.
            SERVICE_UPDATING (5):
                The Membership is being updated by the Hub
                Service.
        """
        CODE_UNSPECIFIED = 0
        CREATING = 1
        READY = 2
        DELETING = 3
        UPDATING = 4
        SERVICE_UPDATING = 5

    code: Code = proto.Field(
        proto.ENUM,
        number=1,
        enum=Code,
    )


class Authority(proto.Message):
    r"""Authority encodes how Google will recognize identities from
    this Membership. See the workload identity documentation for
    more details:

    https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity

    Attributes:
        issuer (str):
            Optional. A JSON Web Token (JWT) issuer URI. ``issuer`` must
            start with ``https://`` and be a valid URL with length <2000
            characters.

            If set, then Google will allow valid OIDC tokens from this
            issuer to authenticate within the workload_identity_pool.
            OIDC discovery will be performed on this URI to validate
            tokens from the issuer.

            Clearing ``issuer`` disables Workload Identity. ``issuer``
            cannot be directly modified; it must be cleared (and
            Workload Identity disabled) before using a new issuer (and
            re-enabling Workload Identity).
        workload_identity_pool (str):
            Output only. The name of the workload identity pool in which
            ``issuer`` will be recognized.

            There is a single Workload Identity Pool per Hub that is
            shared between all Memberships that belong to that Hub. For
            a Hub hosted in {PROJECT_ID}, the workload pool format is
            ``{PROJECT_ID}.hub.id.goog``, although this is subject to
            change in newer versions of this API.
        identity_provider (str):
            Output only. An identity provider that reflects the
            ``issuer`` in the workload identity pool.
        oidc_jwks (bytes):
            Optional. OIDC verification keys for this Membership in JWKS
            format (RFC 7517).

            When this field is set, OIDC discovery will NOT be performed
            on ``issuer``, and instead OIDC tokens will be validated
            using this field.
    """

    issuer: str = proto.Field(
        proto.STRING,
        number=1,
    )
    workload_identity_pool: str = proto.Field(
        proto.STRING,
        number=2,
    )
    identity_provider: str = proto.Field(
        proto.STRING,
        number=3,
    )
    oidc_jwks: bytes = proto.Field(
        proto.BYTES,
        number=4,
    )


class ScopeEventData(proto.Message):
    r"""The data within all Scope events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.gkehub_v1.types.Scope):
            Optional. The Scope event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Scope' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Scope',
    )


class MembershipEventData(proto.Message):
    r"""The data within all Membership events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.gkehub_v1.types.Membership):
            Optional. The Membership event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Membership' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Membership',
    )


class FeatureEventData(proto.Message):
    r"""The data within all Feature events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.gkehub_v1.types.Feature):
            Optional. The Feature event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Feature' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Feature',
    )


class MembershipBindingEventData(proto.Message):
    r"""The data within all MembershipBinding events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.gkehub_v1.types.MembershipBinding):
            Optional. The MembershipBinding event
            payload. Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'MembershipBinding' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='MembershipBinding',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
