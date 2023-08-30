import { PluginComponentType, registerComponent } from "@fiftyone/plugins";
import * as fos from "@fiftyone/state";
import { useRecoilValue } from "recoil";
import React, {
  useEffect,
  useState,
} from "react";
import { ReactECharts } from "./Chart";

function CustomVisualizer({ api }) {
  const mediaField = useRecoilValue(fos.selectedMediaField(true));
  const sampleMap = useRecoilValue(fos.activePcdSlicesToSampleMap);
  const [chartElement, setchartElement] = useState([]);

  useEffect(
    () => {
      Object.entries(sampleMap).map(([slice, sample]) => {
        let mediaUrl;

        if (Array.isArray(sample.urls)) {
          mediaUrl = fos.getSampleSrc(
            sample.urls.find((u) => u.field === mediaField).url
          );
        } else {
          mediaUrl = fos.getSampleSrc(sample.urls[mediaField]);
        }


        const fetchData = async () => {
          // get the data from the api
          var response = await fetch(mediaUrl);
          // convert the data to json
          var json = await response.json();


          setchartElement(
            <ReactECharts data={ json }/>
                    );
        };

        fetchData().catch(console.error);
      });
    },
    [
      sampleMap
    ]
  );
  return (
    <ErrorBoundary>
      { chartElement }
    </ErrorBoundary>
  );
}

function myActivator({ dataset }) {
  return dataset.mediaType ??
    dataset.groupMediaTypes.find((g) => g.mediaType === "point_cloud") !==
    undefined
}

typeof window !== "undefined" &&
  registerComponent({
    name: "profile-viewer",
    // component to delegate to
    component: CustomVisualizer,
    // tell FiftyOne you want to provide a Visualizer
    type: PluginComponentType.Visualizer,
    // activate this plugin when the mediaType is PointCloud
    activator: myActivator
  });

// from fiftyone Looker3d plugin
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError = (error: Error) => ({
    hasError: true,
    error,
  });

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return <Loading>{ this.state.error } < /Loading>;
    }

    return this.props.children;
  }
}
