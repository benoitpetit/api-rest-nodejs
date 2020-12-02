/* ----------- gestion des success ou des erreurs dans une requete ---------- */
exports.success = (result) => {
    return {
        status: 'success',
        result: result
    }
}

exports.error = (message) => {
    return {
        status: 'error',
        message: message
    }
}

// fonction test si la valeur est une instance de Error
exports.isErr = (err) => {
    return err instanceof Error;
}

// verification test Error
exports.checkAndChange = (obj) => {
    if (this.isErr(obj)) {
        return this.error(obj.message)
    } else {
        return this.success(obj)
    }
}
/* -------------------------------------------------------------------------- */
