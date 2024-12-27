import Swal from 'sweetalert2';
export const validateForm = (formData) => {
    let errors = [];

    // Name Validation
    if (!formData.name || formData.name.length < 3) {
        errors.push("Name must contain at least 3 alphabets only.");
    }

    // Gender Validation
    if (!formData.gender) {
        errors.push("Gender must be selected.");
    }

    // Relation Validation
    if (!formData.relation) {
        errors.push("Relation must be chosen.");
    }

    // Father's Name Validation
    if (!formData.fatherName || formData.fatherName.length < 3) {
        errors.push("Father's Name must contain at least 3 alphabets only.");
    }

    // Age Validation
    if (!formData.age || formData.age < 18 || formData.age > 100) {
        errors.push("Age must be between 18 and 100.");
    }

    // Aadhar ID Validation
    if (!formData.aadharId || !/^\d{4}-\d{4}-\d{4}$/.test(formData.aadharId)) {
        errors.push("Aadhar ID must follow the format ####-####-####.");
    }

    // Phone Number Validation
    if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) {
        errors.push("Phone Number must be exactly 10 digits.");
    }

    // Letter Required Validation
    if (formData.letterRequired) {
        if (!formData.to || !/^[A-Za-z\s]+$/.test(formData.to)) {
            errors.push("'To' field must contain alphabets only.");
        }
        if (!formData.purpose || !/^[A-Za-z\s]+$/.test(formData.purpose)) {
            errors.push("'Purpose' field must contain alphabets only.");
        }
    }

    // Dropdown Validation
    if (!formData.acId) {
        errors.push("AC must be selected.");
    }
    if (!formData.mandalId) {
        errors.push("Mandal must be selected.");
    }
    if (!formData.villageId) {
        errors.push("Village must be selected.");
    }

    // Selected Category Validation
    if (!formData.category || formData.category.trim() === "") {
        errors.push("Please select any category among 6.");
    }

    // GrievanceRef Validation
    if (formData.category === "GrievanceRef") {
        if (!formData.grievanceRef) {
            errors.push("Please Enter all the details required for GrievanceRef Category")

        } else {
            if (!formData.grievanceRef.subject || formData.grievanceRef.subject.trim() === "") {
                errors.push("Grievance subject cannot be empty.");
            }
            if (!formData.grievanceRef.content || formData.grievanceRef.content.trim() === "") {
                errors.push("Grievance content cannot be empty.");
            }
        }
    }
    else if (formData.category === "Others") {
        if (!formData.others) {
            errors.push("Please Enter all the details required for Others Category")

        } else {
            if (!formData.others.subject || formData.others.subject.trim() === "") {
                errors.push("Others-subject cannot be empty.");
            }
            if (!formData.others.content || formData.others.content.trim() === "") {
                errors.push("Others-content cannot be empty.");
            }
        }
    }
    // GrievanceRef Validation
    else if (formData.category === "CMRF") {
        if (!formData.cmrf) {
            errors.push("Please Enter all the details required for CMRF Category")

        } else {
            if (!formData.cmrf.mandal) {
                errors.push("CMRF Mandal must be selected.");
            }
            if (!formData.cmrf.village) {
                errors.push("CMRF Village must be selected.");
            }
            if (!formData.cmrf.totalAmount || formData.cmrf.totalAmount < 100) {
                errors.push("Total Amount must be greater 100");
            }
            if (!formData.cmrf.patientName || formData.cmrf.patientName.length < 3) {
                errors.push("Patient Name must contain at least 3 alphabets only.");
            }
            if (!formData.cmrf.relation) {
                errors.push("Please Select the Relation");
            }
            if (!formData.cmrf.fatherName || formData.cmrf.fatherName.length < 3) {
                errors.push("Patient FatherName must contain at least 3 alphabets only.");
            }
            if (!formData.cmrf.address || formData.cmrf.address.length < 3) {
                errors.push("Patient FatherName must contain at least 3 alphabets only.");
            }
            if (!formData.cmrf.disease || formData.cmrf.disease.length < 1) {
                errors.push("Patient Disease must contain at least 3 alphabets only.");
            }
            if (!formData.cmrf.hospitalName || formData.cmrf.hospitalName.length < 3) {
                errors.push("Hospital Name must contain at least 3 alphabets");
            }
            // Aadhar ID Validation
            if (!formData.cmrf.patientAadharId || !/^\d{4}-\d{4}-\d{4}$/.test(formData.cmrf.patientAadharId)) {
                errors.push("Patient Aadhar ID must follow the format ####-####-####.");
            }
            // Phone Number Validation
            if (!formData.cmrf.patientPhoneNumber || !/^\d{10}$/.test(formData.cmrf.patientPhoneNumber)) {
                errors.push("Patient Phone Number must be exactly 10 digits.");
            }
            if (!formData.cmrf.dateOfAdmission || !formData.cmrf.dateOfDischarge) {
                errors.push("DateOfAdmission (or) DateOfDischarge has not been selected");
            }
        }
    }
    else if (formData.category === "JOBS") {
        if (!formData.jobs) {
            errors.push("Please Enter all the details required for JOBS Category")
        } else {
            if (!formData.jobs.referencePersonName || formData.jobs.referencePersonName.length < 3) {
                errors.push("Reference PersonName should be atleast 3 characters");
            }
            if (!formData.jobs.referencePhoneNumber || !/^\d{10}$/.test(formData.jobs.referencePhoneNumber)) {
                errors.push("ReferencePhoneNumber should be atleast 3 characters");
            }
            if (!formData.jobs.qualification || formData.jobs.qualification.length < 1) {
                errors.push("Select any qualification");
            } else {
                if (formData.jobs.qualification === "Others") {
                    if (!formData.jobs.otherQualification && formData.jobs.otherQualification.length < 2) {
                        errors.push("OtherQualification should be atleast 2 characters");
                    }
                }
            }
        }
    }
    else if (formData.category === "Transfer") {
        if (!formData.transfer) {
            errors.push("Please Enter all the details required for Transfer Category")
        } else {
            if (!formData.transfer.transferType || formData.transfer.transferType.trim() === "") {
                errors.push("Please select the transfer type.");
            }

            if (formData.transfer.transferType === "transfer") {
                if (!formData.transfer.fromVillage || formData.transfer.fromVillage.trim() === "") {
                    errors.push("From Village must not be empty.");
                }
                if (!formData.transfer.toVillage || formData.transfer.toVillage.trim() === "") {
                    errors.push("To Village must not be empty.");
                }
            }

            if (formData.transfer.transferType === "retention") {
                if (!formData.transfer.retentionStartedAt || formData.transfer.retentionStartedAt.trim() === "") {
                    errors.push("Retention Started At must not be empty.");
                }
            }

            if (formData.transfer.transferType === "recommendation" || formData.transfer.transferType === "new_post_recommendation") {
                if (!formData.transfer.recommendationLocation || formData.transfer.recommendationLocation.trim() === "") {
                    errors.push("Recommendation Location must not be empty.");
                }
                if (!formData.transfer.recommendationPosition || formData.transfer.recommendationPosition.trim() === "") {
                    errors.push("Recommendation Position must not be empty.");
                }
            }
        }
    }
    else if (formData.category === "DEVELOPMENT") {
        if(!formData.development) {
            errors.push("Please Enter all the details required for Development Category")
        } else {
            if(!formData.development.mandal) {
                errors.push("Please enter Development Mandal")
            }
            if(!formData.development.village) {
                errors.push("Please enter Development Village")
            }
            if(!formData.development.authority || formData.development.authority.trim() === "") {
                errors.push("Please enter Development Authority")
            }
            if(!formData.development.issue || formData.development.issue.trim() === "") {
                errors.push("Please enter Development Issue")
            }
            if(!formData.development.letterIssue) {
                errors.push("Please select the LetterIssue Yes/No")
            }
        }
    }
    // Display Errors
    if (errors.length > 0) {
        Swal.fire({
            title: errors.join("\n"),
            customClass: {
                title: "swal-custom-title",
            },
            showClass: {
                popup: `
            animate__animated
            animate__fadeInUp
            animate__faster
          `,
            },
            hideClass: {
                popup: `
            animate__animated
            animate__fadeOutDown
            animate__faster
          `,
            },
        });
        return false;
    }
    return true;
};