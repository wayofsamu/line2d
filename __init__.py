import fiftyone.operators as foo
import fiftyone.operators.types as types
from time import sleep
import itertools
import matplotlib.pyplot as plt
import json
import fiftyone.utils.utils3d as fou3d
from PIL import Image
import numpy as np
import fiftyone as fo
import os


class Thumbnails(foo.Operator):
    @property
    def config(self):
        return foo.OperatorConfig(
            name="line2d_thumbnails",
            label="Thumbnails",
            execute_as_generator=True)

    async def execute(self, ctx):
        dataset = ctx.dataset
        filepaths = dataset.values("filepath")
    
        groups = itertools.repeat(None)

        all_metadata = []

        num_samples = len(filepaths)

        import os
        for i, (filepath, _) in enumerate(zip(filepaths, groups)):
            progress_label = f"Loading {i} of {num_samples}"
            progress_view = types.ProgressView(label=progress_label)
            loading_schema = types.Object()
            loading_schema.int("percent_complete", view=progress_view)
            show_output_params = {
                "outputs": types.Property(loading_schema).to_json(),
                "results": {"percent_complete": i / num_samples},
            }
            yield ctx.trigger("show_output", show_output_params)

        
            image_path = filepath.replace(".pcd", ".png")

            with open(filepath, 'r') as f:
                data = json.load(f)
                plt.plot(data["x"], data["y"],linewidth=0.1)
                plt.tight_layout()
                plt.axis('off')
                plt.savefig(image_path)
                plt.close()
                im = Image.open(image_path)
                width, height = im.size
            

            metadata = fou3d.OrthographicProjectionMetadata(min_bound=None, max_bound=None, width=width, height=height)

            metadata.filepath = os.path.abspath(image_path)

            all_metadata.append(metadata)

        progress_label = f"Loading {num_samples} of {num_samples}"
        progress_view = types.ProgressView(label=progress_label)
        loading_schema = types.Object()
        loading_schema.int("percent_complete", view=progress_view)
        show_output_params = {
            "outputs": types.Property(loading_schema).to_json(),
            "results": {"percent_complete": 1},
        }
        yield ctx.trigger("show_output", show_output_params)
        dataset.set_values("orthographic_projection_metadata", all_metadata)
        dataset.save()
            
    def resolve_placement(self, ctx):
        return types.Placement(
            # Display placement in the actions row of samples grid
            types.Places.SAMPLES_GRID_SECONDARY_ACTIONS,
            # Display a button as the placement
            types.Button(
                # label for placement button visible on hover
                label="Generate Thumbnails",
                # icon for placement button. If not provided, button with label
                # will be displayed
                icon=None,
                # skip operator prompt when we do not require an input from the user
                prompt=False
            )
        )

class LoadExampleData(foo.Operator):
    @property
    def config(self):
        return foo.OperatorConfig(
            name="line2d_example_dataset",
            label="Generate Example Data")
    
    def resolve_input(self, ctx):
        inputs = types.Object()
        inputs.str("outfolder", label="Output Folder Path", required=True)
        header = "Generate Example Data"
        return types.Property(inputs, view=types.View(label=header))

    def execute(self, ctx):
        samples = []
        outfolder = ctx.params["outfolder"]
        ctx.log(outfolder)

        if not os.path.exists(outfolder):
            os.mkdir(outfolder)
        ctx.log(outfolder)

        for i in range(100):
            points0 = np.random.normal(0, size=(10000))
            filepath = outfolder+f"/line2d_{i}.pcd"
            ctx.log(filepath)

            with open(filepath, 'w') as f:
                json.dump(dict(x=list(range(len(points0))), y=list(points0)), f)

            samples.append(
                fo.Sample(
                    filepath=filepath,
                ))

        dataset = fo.Dataset("line2d_example_dataset")
        dataset.add_samples(samples)
        dataset.persistent = True
        dataset.save()
    
            
    def resolve_placement(self, ctx):
        return types.Placement(
            # Display placement in the actions row of samples grid
            types.Places.SAMPLES_GRID_SECONDARY_ACTIONS,
            # Display a button as the placement
            types.Button(
                # label for placement button visible on hover
                label="Generate Example Dataset",
                # icon for placement button. If not provided, button with label
                # will be displayed
                icon=None,
                # skip operator prompt when we do not require an input from the user
                prompt=True
            )
        )

def register(p):
    p.register(Thumbnails)
    p.register(LoadExampleData)
