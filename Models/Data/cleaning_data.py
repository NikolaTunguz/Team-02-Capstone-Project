#note for anyone looking at this
#this folder renames the files in the annotatedData folder, giving them numerical names awith their classification
#it renames the custom annotations & images as sets, dont run it unless new data is added & its unnamed

import os
import shutil
import cv2
import numpy as np

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

        new_image_name = f"gun_{193 + index}{image_extension}"
        new_label_name = f"gun_{193 + index}{label_extension}"

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

        new_image_name = f"no_gun_{207 + index}{image_extension}"

        os.rename(
            os.path.join(images_path, image_file_name),
            os.path.join(images_path, new_image_name)
            )
        
        new_label_name = f"no_gun_{207 + index}.txt"
        label_file_path = os.path.join(labels_path, new_label_name)

        with open(label_file_path, 'w') as f:
            f.write("0 0.5 0.5 1.0 1.0\n")

def convert_raw_thermal_to_displayable(npy_file):
    image = npy_file
    image_data, thermal_data = np.array_split(image, 2, axis = 1)
    hi = image_data[:, :, 0].astype(np.uint16)
    lo = image_data[:, :, 1].astype(np.uint16)
    raw_temp = hi * 256 + lo

    #normalize for display (0–255)
    normalized = cv2.normalize(raw_temp, None, 0, 255, cv2.NORM_MINMAX)
    normalized = normalized.astype(np.uint8)

    #apply a color map for visibility
    colored = cv2.applyColorMap(normalized, cv2.COLORMAP_JET)

    return colored

def separate_npy_to_jpg(npy_folder_path, jpg_folder_path):
    with_gun_npy = os.path.join(npy_folder_path, 'with gun')
    without_gun_npy = os.path.join(npy_folder_path, 'without gun')
    with_gun_jpg = os.path.join(jpg_folder_path, 'with gun')
    without_gun_jpg = os.path.join(jpg_folder_path, 'without gun')

    gun_npy = sorted(os.listdir(with_gun_npy))
    no_gun_npy = sorted(os.listdir(without_gun_npy))

    for index, npy_file_name in enumerate(gun_npy):
        path = os.path.join(with_gun_npy, npy_file_name)
        file = np.load(path)
        image = convert_raw_thermal_to_displayable(file)
        new_location = os.path.join(with_gun_jpg, f'gun_{index}.jpg')
        cv2.imwrite(new_location, image)

    for index, npy_file_name in enumerate(no_gun_npy):
        path = os.path.join(without_gun_npy, npy_file_name)
        file = np.load(path)
        image = convert_raw_thermal_to_displayable(file)
        new_location = os.path.join(without_gun_jpg, f'no_gun_{index}.jpg')
        cv2.imwrite(new_location, image)

def combine_datasets(folder_path_one, folder_path_two, destination_folder_path):
    folder_paths = [folder_path_one, folder_path_two]
    categories = ['without gun', 'with gun']
    gun_counter = 0
    no_gun_counter = 0

    for folder in folder_paths:
        for category in categories:
            images_path = os.path.join(folder, category, 'images')
            labels_path = os.path.join(folder, category, 'labels')
            destination_images_path = os.path.join(destination_folder_path, category, 'images')
            destination_labels_path = os.path.join(destination_folder_path, category, 'labels')

            images = sorted(os.listdir(images_path))
            labels = sorted(os.listdir(labels_path))

            for index, (image_file_name, label_file_name) in enumerate(zip(images, labels)):
                image_extension = os.path.splitext(image_file_name)[1]
                label_extension = os.path.splitext(label_file_name)[1]

                if category == 'without gun':
                    new_image_name = f"no_gun_{no_gun_counter}{image_extension}"
                    new_label_name = f"no_gun_{no_gun_counter}{label_extension}"
                    no_gun_counter += 1
                elif category == 'with gun':
                    new_image_name = f"gun_{gun_counter}{image_extension}"
                    new_label_name = f"gun_{gun_counter}{label_extension}"
                    gun_counter += 1

                source_image = cv2.imread(os.path.join(images_path, image_file_name))
                cv2.imwrite(os.path.join(destination_images_path, new_image_name), source_image)

                label_information = None
                with open(os.path.join(labels_path, label_file_name), 'r') as f_in:
                    label_information = f_in.read()
                with open(os.path.join(destination_labels_path, new_label_name), 'w') as f_out:
                    f_out.write(label_information)

def change_no_gun_labels(no_gun_label_folder_path):
    labels_path = os.path.join(no_gun_label_folder_path)

    files = sorted(os.listdir(labels_path))
    for index, label_name in enumerate(files):
        label_path = os.path.join(no_gun_label_folder_path, label_name)

        with open(label_path, 'w') as f:
            f.write("0 0.5 0.5 1.0 1.0\n")

def main():
    base_path = "Data/AnnotatedData"
    with_gun_path = os.path.join(base_path, "with gun")
    without_gun_path = os.path.join(base_path, "without gun")

    npy_path = os.path.join('collected_data', 'npy_files')
    jpg_path = os.path.join('collected_data', 'jpg_files')

    collected_annotated_gun = os.path.join('collected_data', 'annotated', 'with gun')
    collected_annotated_no_gun = os.path.join('collected_data', 'annotated', 'without gun')

    #rename_with_gun_files(with_gun_path)
    #rename_without_gun_files(without_gun_path)
    #separate_npy_to_jpg(npy_path, jpg_path)
    #rename_with_gun_files(collected_annotated_gun)
    #rename_without_gun_files(collected_annotated_no_gun)

    previous_dataset_path = os.path.join('AnnotatedData')
    new_dataset_path = os.path.join('collected_data', 'annotated')
    destination_path = os.path.join('CombinedData')
    #combine_datasets(previous_dataset_path, new_dataset_path, destination_path)
    #change_no_gun_labels(os.path.join('CombinedData', 'without gun', 'labels'))

    new_npy_path = os.path.join('new_data', 'npy_files')
    new_jpg_path = os.path.join('new_data', 'jpg_files')
    #separate_npy_to_jpg(new_npy_path, new_jpg_path)
    new_annotated_gun = os.path.join('new_data', 'annotated', 'with gun')
    new_annotated_no_gun = os.path.join('new_data', 'annotated', 'without gun')
    #rename_with_gun_files(new_annotated_gun)
    #rename_without_gun_files(new_annotated_no_gun)



if __name__ == "__main__":
    main()