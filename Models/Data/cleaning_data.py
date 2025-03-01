#note for anyone looking at this
#this folder renames the files in the annotatedData folder, giving them numerical names awith their classification
#it renames the custom annotations & images as sets, dont run it unless new data is added & its unnamed

import os

def rename_with_gun_files(folder_path):
    images_path = os.path.join(folder_path, "images")
    labels_path = os.path.join(folder_path, "labels")

    images = sorted(os.listdir(images_path))
    labels = sorted(os.listdir(labels_path))

    if len(images) != len(labels):
        print("Number of files dont match")
    else:
        print("file sizes match")

    for index, (image_file_name, label_file_name) in enumerate(zip(images, labels)):
        image_extension = os.path.splitext(image_file_name)[1]
        label_extension = os.path.splitext(label_file_name)[1]

        new_image_name = f"gun_{index}{image_extension}"
        new_label_name = f"gun_{index}{label_extension}"

        os.rename(
            os.path.join(images_path, image_file_name),
            os.path.join(images_path, new_image_name)
        )
        os.rename(
            os.path.join(labels_path, label_file_name),
            os.path.join(labels_path, new_label_name)
            )
        
        label_file_path = os.path.join(labels_path, new_label_name)
        with open(label_file_path, 'r') as f:
            lines = f.readlines()

        updated_lines = []
        for line in lines:
            parts = line.split()
            parts[0] = '1'

            updated_lines.append(" ".join(parts))

        with open(label_file_path, 'w') as f:
            f.writelines(updated_lines)

def rename_without_gun_files(folder_path):
    images_path = os.path.join(folder_path, "images")
    labels_path = os.path.join(folder_path, "labels")

    images = sorted(os.listdir(images_path))


    for index, image_file_name in enumerate(images):
        image_extension = os.path.splitext(image_file_name)[1]

        new_image_name = f"no_gun_{index}{image_extension}"

        os.rename(
            os.path.join(images_path, image_file_name),
            os.path.join(images_path, new_image_name)
            )
        
        new_label_name = f"no_gun_{index}.txt"
        label_file_path = os.path.join(labels_path, new_label_name)

        with open(label_file_path, 'w') as f:
            f.write("0 0 0 0 0\n")

def main():
    base_path = "Data/AnnotatedData"
    with_gun_path = os.path.join(base_path, "with gun")
    without_gun_path = os.path.join(base_path, "without gun")

    #rename_with_gun_files(with_gun_path)
    #rename_without_gun_files(without_gun_path)

if __name__ == "__main__":
    main()