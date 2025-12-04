import { Action, ActionPanel, Form, Icon, Toast, getPreferenceValues, showToast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { Logo } from "@/types/logo";
import { LocalFolderManager } from "@/utils/local-folder-manager";

interface EditLogoDetailsProps {
    logo: Logo;
    onLogoUpdated: () => void;
}

export function EditLogoDetails({ logo, onLogoUpdated }: EditLogoDetailsProps) {
    const { pop } = useNavigation();
    const [nameEn, setNameEn] = useState(logo.nameEn);
    const [nameAr, setNameAr] = useState(logo.nameAr);
    const [keywords, setKeywords] = useState(logo.keywords.join(", "));
    const [category, setCategory] = useState(logo.category);

    const handleSubmit = async () => {
        try {
            const prefs = getPreferenceValues<{ logosFolderPath?: string }>();
            if (!prefs.logosFolderPath) {
                throw new Error("Local logos folder path not configured");
            }

            const manager = new LocalFolderManager(prefs.logosFolderPath);

            manager.updateLogoMetadata(logo.id, {
                nameEn,
                nameAr,
                keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
                category
            });

            await showToast({
                style: Toast.Style.Success,
                title: "Logo Updated",
                message: "Metadata saved successfully"
            });

            onLogoUpdated();
            pop();
        } catch (error) {
            await showToast({
                style: Toast.Style.Failure,
                title: "Update Failed",
                message: error instanceof Error ? error.message : "Unknown error"
            });
        }
    };

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Save Changes" onSubmit={handleSubmit} icon={Icon.Check} />
                </ActionPanel>
            }
        >
            <Form.TextField
                id="nameEn"
                title="Name (English)"
                value={nameEn}
                onChange={setNameEn}
            />
            <Form.TextField
                id="nameAr"
                title="Name (Arabic)"
                value={nameAr}
                onChange={setNameAr}
            />
            <Form.TextArea
                id="keywords"
                title="Keywords"
                placeholder="Comma separated keywords"
                value={keywords}
                onChange={setKeywords}
            />
            <Form.Dropdown
                id="category"
                title="Category"
                value={category}
                onChange={(val) => setCategory(val as any)}
            >
                <Form.Dropdown.Item value="custom" title="Custom" />
                <Form.Dropdown.Item value="government" title="Government" />
                <Form.Dropdown.Item value="finance" title="Finance" />
                <Form.Dropdown.Item value="telecom" title="Telecom" />
                <Form.Dropdown.Item value="energy" title="Energy" />
                <Form.Dropdown.Item value="airlines" title="Airlines" />
                <Form.Dropdown.Item value="retail" title="Retail" />
                <Form.Dropdown.Item value="technology" title="Technology" />
                <Form.Dropdown.Item value="healthcare" title="Healthcare" />
                <Form.Dropdown.Item value="education" title="Education" />
            </Form.Dropdown>
        </Form>
    );
}
