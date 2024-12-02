"use client"
import { useState } from "react";
import {ClassificationResponse, ParsedResult} from "@/types/classification";
import { Animal, animals } from '@/types/animals';
import { formatConfidence } from "../utils/formatters";

const Header = () => (
    <div className="text-center">
        <h1 className="text-2xl font-bold">Animal Classification System</h1>
        <p className="mt-2 text-gray-800 dark:text-gray-500 max-w-2xl mx-auto">
            Welcome to our intelligent animal recognition system! Upload any image of an animal, and our AI
            will identify it, provide fascinating information from Wikipedia, and let you know if the animal could be
            dangerous. Perfect for wildlife enthusiasts, students, and anyone curious about animals they encounter.
        </p>
    </div>
);

const AnimalsTable = () => (
    <div className="w-full">
        <h2 className="font-bold mb-4">Supported Animals</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-600 dark:border-gray-700">
                <tbody>
                {Array.from({ length: Math.ceil(animals.length / 3) }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="bg-gray-50 dark:bg-gray-900">
                        {[0, 1, 2].map((colIndex) => {
                            const animalIndex = rowIndex * 3 + colIndex;
                            return (
                                <td key={colIndex} className="border border-gray-600 dark:border-gray-700 p-2">
                                    {animals[animalIndex]?.name || ''}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
);

const UploadForm = ({ onSubmit, onImageUpload, selectedImage }: {
    onSubmit: (e: React.FormEvent) => Promise<void>;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedImage: File | null;
}) => (
    <div className="w-full">
        <h2 className="font-bold mb-4">Upload Image</h2>
        <p className="text-sm text-gray-600 mb-4">
            Note: Classification is limited to animals shown in the table on the left.
            Please upload a clear image of a single animal.
        </p>
        <form onSubmit={onSubmit}>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="w-full"
                />
                {selectedImage && (
                    <p className="mt-2 text-sm">Selected: {selectedImage.name}</p>
                )}
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-lg mt-4 py-2 hover:bg-blue-700"
            >
                Classify Animal
            </button>
        </form>
    </div>
);

const Results = ({
                     selectedImage,
                     classificationResults,
                     animalInformation,
                     isAnimalDangerous
                 }: {
    selectedImage: File | null;
    classificationResults: ParsedResult[];
    animalInformation: string;
    isAnimalDangerous: boolean;
}) => (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            {selectedImage && (
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Uploaded Image</h3>
                    <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Preview"
                        className="max-h-100 rounded-lg object-contain"
                    />
                </div>
            )}
            <div className="mb-6">
                <h3 className="font-semibold mb-2">Top Match</h3>
                <div>
                    {classificationResults.slice(0, 1).map((result, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <span>{result.text}</span>
                            <span className="text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                {formatConfidence(result.score)} confidence
              </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">About this Animal</h3>
            <div className="mb-3">
                <span className="text-sm font-medium mr-2">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${isAnimalDangerous ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {isAnimalDangerous ? 'Dangerous' : 'Safe'}
        </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{animalInformation}</p>
        </div>
    </div>
);

export default function Home() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [animalInformation, setAnimalInformation] = useState<string>("");
    const [isAnimalDangerous, setIsAnimalDangerous] = useState<boolean>(false);
    const [classificationResults, setClassificationResults] = useState<ParsedResult[]>([]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setAnimalInformation("");
            setClassificationResults([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedImage) return;

        setAnimalInformation("Processing classify image...");

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);

            const response = await fetch('/api/classification', {
                method: 'POST',
                body: formData,
            });

            const data: ClassificationResponse = await response.json();
            setClassificationResults(data.results);
            setAnimalInformation(data.message);
            setAnimalInformation("Fetching animal information...");

            if (data.results.length > 0) {
                const firstAnimal = data.results[0].text;
                await fetchAnimalInformation(firstAnimal);
            }
        } catch (error) {
            console.error('Error:', error);
            setAnimalInformation('Error processing image');
        }
    };

    const fetchAnimalInformation = async (animalName: string) => {
        try {
            const response = await fetch(`/api/animal-information-agent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ animalInformation: animalName })
            });

            const animalInfo: Animal = await response.json();
            setAnimalInformation(animalInfo.information ?? "No information found");
            setIsAnimalDangerous(animalInfo.dangerous ?? false);
        } catch (error) {
            console.error('Error Animal Information:', error);
        }
    };

    return (
        <div className="min-h-screen p-4 pb-20 gap-8 sm:p-20">
            <main className="flex flex-col gap-6 items-center w-full">
                <Header />
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AnimalsTable />
                    <UploadForm
                        onSubmit={handleSubmit}
                        onImageUpload={handleImageUpload}
                        selectedImage={selectedImage}
                    />
                </div>
                {animalInformation && (
                    <Results
                        selectedImage={selectedImage}
                        classificationResults={classificationResults}
                        animalInformation={animalInformation}
                        isAnimalDangerous={isAnimalDangerous}
                    />
                )}
            </main>
        </div>
    );
}
