# Copyright 2022 Google Inc.
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
# pylint: disable=protected-access
"""
Cloud functions to handle Remote Config events.
"""
import dataclasses as _dataclasses
import functools as _functools
import datetime as _dt
import typing as _typing
import cloudevents.http as _ce
import enum as _enum

import firebase_functions.private.util as _util

from firebase_functions.core import CloudEvent
from firebase_functions.options import EventHandlerOptions


@_dataclasses.dataclass(frozen=True)
class ConfigUser:
    """
    All the fields associated with the person/service account that wrote a Remote Config template.
    """

    name: str
    """
    Display name.
    """

    email: str
    """
    Email address.
    """

    image_url: str
    """
    Image URL.
    """


class ConfigUpdateOrigin(str, _enum.Enum):
    """
    Where the Remote Config update action originated.
    """

    REMOTE_CONFIG_UPDATE_ORIGIN_UNSPECIFIED = "REMOTE_CONFIG_UPDATE_ORIGIN_UNSPECIFIED"
    """
    Catch-all for unrecognized values.
    """

    CONSOLE = "CONSOLE"
    """
    The update came from the Firebase UI.
    """

    REST_API = "REST_API"
    """
    The update came from the Remote Config REST API.
    """

    ADMIN_SDK_NODE = "ADMIN_SDK_NODE"
    """
    The update came from the Firebase Admin Node SDK.
    """


class ConfigUpdateType(str, _enum.Enum):
    """
    What type of update was associated with the Remote Config template version.
    """

    REMOTE_CONFIG_UPDATE_TYPE_UNSPECIFIED = "REMOTE_CONFIG_UPDATE_TYPE_UNSPECIFIED"
    """
    Catch-all for unrecognized enum values.
    """

    INCREMENTAL_UPDATE = "INCREMENTAL_UPDATE"
    """
    A regular incremental update.
    """

    FORCED_UPDATE = "FORCED_UPDATE"
    """
    A forced update. The ETag was specified as "*" in an UpdateRemoteConfigRequest
    request or the "Force Update" button was pressed on the console.
    """

    ROLLBACK = "ROLLBACK"
    """
    A rollback to a previous Remote Config template.
    """


@_dataclasses.dataclass(frozen=True)
class ConfigUpdateData:
    """
    The data within Firebase Remote Config update events.
    """

    version_number: int
    """
    The version number of the version's corresponding Remote Config template.
    """

    update_time: _dt.datetime
    """
    When the Remote Config template was written to the Remote Config server.
    """

    update_user: ConfigUser
    """
    Aggregation of all metadata fields about the account that performed the update.
    """

    description: str
    """
    The user-provided description of the corresponding Remote Config template.
    """

    update_origin: ConfigUpdateOrigin
    """
    Where the update action originated.
    """

    update_type: ConfigUpdateType
    """
    What type of update was made.
    """

    rollback_source: int | None = None
    """
    Only present if this version is the result of a rollback, and will be
    the version number of the Remote Config template that was rolled-back to.
    """


_E1 = CloudEvent[ConfigUpdateData]
_C1 = _typing.Callable[[_E1], None]


def _config_handler(func: _C1, raw: _ce.CloudEvent) -> None:
    event_attributes = raw._get_attributes()
    event_data: _typing.Any = raw.get_data()
    event_dict = {**event_data, **event_attributes}

    config_data = ConfigUpdateData(
        version_number=event_data["versionNumber"],
        update_time=_dt.datetime.strptime(event_data["updateTime"],
                                          "%Y-%m-%dT%H:%M:%S.%f%z"),
        update_user=ConfigUser(
            name=event_data["updateUser"]["name"],
            email=event_data["updateUser"]["email"],
            image_url=event_data["updateUser"]["imageUrl"],
        ),
        description=event_data["description"],
        update_origin=ConfigUpdateOrigin(event_data["updateOrigin"]),
        update_type=ConfigUpdateType(event_data["updateType"]),
        rollback_source=event_data.get("rollbackSource", None),
    )

    event: CloudEvent[ConfigUpdateData] = CloudEvent(
        data=config_data,
        id=event_dict["id"],
        source=event_dict["source"],
        specversion=event_dict["specversion"],
        subject=event_dict["subject"] if "subject" in event_dict else None,
        time=_dt.datetime.strptime(
            event_dict["time"],
            "%Y-%m-%dT%H:%M:%S.%f%z",
        ),
        type=event_dict["type"],
    )

    func(event)


@_util.copy_func_kwargs(EventHandlerOptions)
def on_config_updated(**kwargs) -> _typing.Callable[[_C1], _C1]:
    """
    Event handler which triggers when data is updated in a Remote Config.

    Example:

    .. code-block:: python

      @on_config_updated()
      def example(event: CloudEvent[ConfigUpdateData]) -> None:
          pass

    :param \\*\\*kwargs: Pub/Sub options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.EventHandlerOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.core.CloudEvent` \\[
            :exc:`firebase_functions.remote_config_fn.ConfigUpdateData` \\[
            :exc:`typing.Any` \\] \\] \\], `None` \\]
            A function that takes a CloudEvent and returns None.
    """
    options = EventHandlerOptions(**kwargs)

    def on_config_updated_inner_decorator(func: _C1):

        @_functools.wraps(func)
        def on_config_updated_wrapped(raw: _ce.CloudEvent):
            return _config_handler(func, raw)

        _util.set_func_endpoint_attr(
            on_config_updated_wrapped,
            options._endpoint(
                func_name=func.__name__,
                event_filters={},
                event_type="google.firebase.remoteconfig.remoteConfig.v1.updated"
            ),
        )
        return on_config_updated_wrapped

    return on_config_updated_inner_decorator
