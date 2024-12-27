import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Modal, Button } from "react-bootstrap";
import logoImage from "../Images/leadlogo.PNG";

const JsonToPdf = ({ jsonData, acName, mandalName, villageName }) => {
    const [showModal, setShowModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - margin * 2;
        const contentHeight = pageHeight - margin * 2;
        const lineSpacing = 8;

        let yPosition = margin + 50;

        const addHeader = () => {
            // Add Logo
            const logoWidth = 50;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(logoImage, "PNG", logoX, margin, logoWidth, 20);

            // Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Grievance Acknowledgment", pageWidth / 2, margin + 30, null, null, "center");

            // Subtitle
            doc.setFontSize(14);
            doc.text(`Office of MLA, ${acName.get(jsonData.acId)}`, pageWidth / 2, margin + 40, null, null, "center");

            // Horizontal Line
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.line(margin, margin + 45, pageWidth - margin, margin + 45);
        };

        const addFooter = () => {
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.text(
                "CCMS Powered by LEAD™ Consulting LLP",
                pageWidth - margin,
                pageHeight - margin,
                null,
                null,
                "right"
            );
        };

        const addPageIfNeeded = () => {
            if (yPosition > contentHeight) {
                addFooter();
                doc.addPage();
                addHeader();
                yPosition = margin + 50;
            }
        };

        addHeader();

        // Add Key-Value Pairs
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const userInfo = [
            ["Name", jsonData.name],
            ["Gender", jsonData.gender],
            ["Father's Name", jsonData.fatherName],
            ["Age", jsonData.age],
            ["Aadhar ID", jsonData.aadharId],
            ["Phone Number", jsonData.phoneNumber],
            ["Letter Required", jsonData.letterRequired ? "Yes" : "No"],
            ["Category", jsonData.category],
            ["Token", jsonData.token],
            ["AC", acName.get(jsonData.acId)],
            ["Mandal", mandalName.get(jsonData.mandalId)],
            ["Village", villageName.get(jsonData.villageId)],
        ];

        userInfo.forEach(([key, value]) => {
            doc.text(`${key}:`, margin, yPosition);
            doc.text(`${value}`, margin + 70, yPosition);
            yPosition += lineSpacing;
            addPageIfNeeded();
        });

        // Add Grievance Information
        doc.setFont("helvetica", "bold");
        doc.text("Grievance Reference", margin, yPosition);
        yPosition += lineSpacing;
        doc.setFont("helvetica", "normal");

        var grievanceInfo = [];
        switch (jsonData.category) {
            case "GrievanceRef":
                grievanceInfo = [
                    ["Subject", jsonData.grievanceRef.subject],
                    ["Content", jsonData.grievanceRef.content]
                ]
                break
            case "Others":
                grievanceInfo = [
                    ["Subject", jsonData.others.subject],
                    ["Content", jsonData.others.content]
                ]
                break
            case "CMRF":
                grievanceInfo = [
                    ["patientName", jsonData.cmrf.patientName],
                    //["Relation",jsonData.crmf.relation],
                    ["FatherName", jsonData.cmrf.fatherName],
                    ["Patient-AadharId", jsonData.cmrf.patientAadharId],
                    ["Patient PhoneNumber", jsonData.cmrf.patientPhoneNumber],
                    ["Address", jsonData.cmrf.address],
                    ["Mandal", mandalName.get(jsonData.cmrf.mandal)],
                    ["Village", villageName.get(jsonData.cmrf.village)],
                    ["HospitalName", jsonData.cmrf.hospitalName],
                    ["disease", jsonData.cmrf.disease],
                    ["DateOfAdmission", jsonData.cmrf.dateOfAdmission],
                    ["DateOfDischarge", jsonData.cmrf.dateOfDischarge],
                    ["TotalAmount", jsonData.cmrf.totalAmount]
                ]
                break
            case "JOBS":
                var referencePersonName = jsonData.jobs.referencePersonName;
                var referencePhoneNumber = jsonData.jobs.referencePhoneNumber;
                var qualification = jsonData.jobs.qualification;
                var otherQualification = jsonData.jobs.otherQualification;
                grievanceInfo = [
                   ["Reference PersonName",referencePersonName],
                   ["Reference PhoneNumber",referencePhoneNumber],
                   ["Qualification",qualification]
                ]
                if (qualification==="others") {
                    grievanceInfo.push(["Other-Qualification",otherQualification])
                }
                break
            case "DEVELOPMENT":
                var mandal = mandalName.get(jsonData.development.mandal);
                var village = villageName.get(jsonData.development.village);
                var authority = jsonData.development.authority;
                var issue = jsonData.development.issue;
                var letterIssue = jsonData.development.letterIssue;
                grievanceInfo = [
                    ["Mandal",mandal],
                    ["village",village],
                    ["Authority",authority],
                    ["Issue",issue],
                    ["LetterIssue",letterIssue]
                ]
                break
            case "Transfer":
                var transferType = jsonData.transfer.transferType
                if (transferType==="transfer") {
                    var fromVillage = jsonData.transfer.fromVillage
                    var tovillage = jsonData.transfer.toVillage
                    grievanceInfo.push(["Transfer Type","Transfer"])
                    grievanceInfo.push(["From Village",fromVillage])
                    grievanceInfo.push(["To Village",tovillage])
                }
                if (transferType==="retention"){
                    grievanceInfo.push(["Transfer Type","Retention"])
                    var retention = jsonData.transfer.retentionStartedAt
                    grievanceInfo.push(["Retention Started At",retention])
                }
                if (transferType==="recommendation") {
                    var recomLocation = jsonData.transfer.recommendationLocation
                    var recomPosition = jsonData.transfer.recommendationPosition
                    grievanceInfo.push(["Transfer Type","Recommendation"])
                    grievanceInfo.push(["Recommendation Location",recomLocation])
                    grievanceInfo.push(["Recommendation Position",recomPosition])
                }
                if (transferType==="new_post_recommendation") {
                    grievanceInfo.push(["Transfer Type","New Post Recommendation"])
                    var recomLocation = jsonData.transfer.recommendationLocation
                    var recomPosition = jsonData.transfer.recommendationPosition
                    grievanceInfo.push(["Recommendation Location",recomLocation])
                    grievanceInfo.push(["Recommendation Position",recomPosition])
                }
                break
            default:
                grievanceInfo = []
                break
        }

        grievanceInfo.forEach(([key, value]) => {
            doc.text(`${key}:`, margin, yPosition);
            doc.text(`${value}`, margin + 70, yPosition);
            yPosition += lineSpacing;
            addPageIfNeeded();
        });

        // Add Footer Note
        yPosition += lineSpacing;
        doc.text("Please use the reference number stated for future correspondence if any.", margin, yPosition);
        yPosition += lineSpacing;
        doc.text("This is an auto-generated acknowledgment receipt of the grievance.", margin, yPosition);
        yPosition += lineSpacing;

        addFooter();

        // Generate PDF Blob URL for Preview
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);
        setShowModal(true);
    };

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = pdfUrl;
        const filename = jsonData.token ? `${jsonData.token}.pdf` : "UserDetails.pdf";
        link.download = filename;
        link.click();
        setShowModal(false);
    };

    return (
        <>
            <Button onClick={generatePDF} variant="primary">
                Preview PDF
            </Button>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>PDF Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pdfUrl && <iframe src={pdfUrl} width="100%" height="500px" title="PDF Preview"></iframe>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleDownload}>
                        Download PDF
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default JsonToPdf;