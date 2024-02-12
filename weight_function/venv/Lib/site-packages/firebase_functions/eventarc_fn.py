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
"""Cloud functions to handle Eventarc events."""

# pylint: disable=protected-access
import typing as _typing
import functools as _functools
import datetime as _dt
import cloudevents.http as _ce

import firebase_functions.options as _options
import firebase_functions.private.util as _util
from firebase_functions.core import CloudEvent


@_util.copy_func_kwargs(_options.EventarcTriggerOptions)
def on_custom_event_published(
    **kwargs
) -> _typing.Callable[[_typing.Callable[[CloudEvent], None]], _typing.Callable[
    [CloudEvent], None]]:
    """
    Creates a handler for events published on the default event eventarc channel.

    Example:

    .. code-block:: python

      from firebase_functions import eventarc_fn

      @eventarc_fn.on_custom_event_published(
          event_type="firebase.extensions.storage-resize-images.v1.complete",
      )
      def onimageresize(event: eventarc_fn.CloudEvent) -> None:
          pass

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.EventarcTriggerOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.core.CloudEvent` \\], `None` \\]
            A function that takes a CloudEvent and returns None.
    """
    options = _options.EventarcTriggerOptions(**kwargs)

    def on_custom_event_published_decorator(func: _typing.Callable[[CloudEvent],
                                                                   None]):

        @_functools.wraps(func)
        def on_custom_event_published_wrapped(raw: _ce.CloudEvent):
            event_attributes = raw._get_attributes()
            event_data: _typing.Any = raw.get_data()
            event_dict = {**event_data, **event_attributes}
            event: CloudEvent = CloudEvent(
                data=event_data,
                id=event_dict["id"],
                source=event_dict["source"],
                specversion=event_dict["specversion"],
                subject=event_dict["subject"]
                if "subject" in event_dict else None,
                time=_dt.datetime.strptime(
                    event_dict["time"],
                    "%Y-%m-%dT%H:%M:%S.%f%z",
                ),
                type=event_dict["type"],
            )
            func(event)

        _util.set_func_endpoint_attr(
            on_custom_event_published_wrapped,
            options._endpoint(func_name=func.__name__),
        )
        _util.set_required_apis_attr(
            on_custom_event_published_wrapped,
            options._required_apis(),
        )
        return on_custom_event_published_wrapped

    return on_custom_event_published_decorator
